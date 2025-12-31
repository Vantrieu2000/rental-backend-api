import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { PropertiesService } from '../properties/properties.service';
import {
  CreateRoomDto,
  UpdateRoomDto,
  RoomFiltersDto,
  AssignTenantDto,
  VacateRoomDto,
} from './dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private propertiesService: PropertiesService,
  ) {}

  /**
   * Create a new room
   */
  async create(createRoomDto: CreateRoomDto, userId: string): Promise<Room> {
    // Verify property exists and user owns it
    await this.propertiesService.findOne(createRoomDto.propertyId, userId);

    const room = new this.roomModel(createRoomDto);
    return room.save();
  }

  /**
   * Find all rooms with filters and pagination
   */
  async findAll(
    filters: RoomFiltersDto,
    userId: string,
  ): Promise<{ data: Room[]; total: number; page: number; limit: number }> {
    const query: any = {};

    // If propertyId filter is provided, verify ownership
    if (filters.propertyId) {
      await this.propertiesService.findOne(filters.propertyId, userId);
      query.propertyId = filters.propertyId;
    } else {
      // Get all properties owned by user
      const properties = await this.propertiesService.findAll({}, userId);
      const propertyIds = properties.map((p: any) => p._id);
      query.propertyId = { $in: propertyIds };
    }

    // Add status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Add price range filters
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.rentalPrice = {};
      if (filters.minPrice !== undefined) {
        query.rentalPrice.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.rentalPrice.$lte = filters.maxPrice;
      }
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.roomModel
        .find(query)
        .populate('currentTenantId')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.roomModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find one room by ID
   */
  async findOne(id: string, userId: string): Promise<Room> {
    const room = await this.roomModel
      .findById(id)
      .populate('currentTenantId')
      .exec();

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    // Verify ownership through property
    await this.propertiesService.findOne(
      room.propertyId.toString(),
      userId,
    );

    return room;
  }

  /**
   * Update a room
   */
  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
    userId: string,
  ): Promise<Room> {
    // Verify ownership first
    await this.findOne(id, userId);

    const room = await this.roomModel
      .findByIdAndUpdate(id, { $set: updateRoomDto }, { new: true })
      .exec();

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  /**
   * Assign tenant to room
   */
  async assignTenant(
    id: string,
    assignTenantDto: AssignTenantDto,
    userId: string,
  ): Promise<Room> {
    // Verify ownership first
    const room = await this.findOne(id, userId);

    // Check if room is already occupied
    if (room.status === 'occupied') {
      throw new BadRequestException('Room is already occupied');
    }

    // Update room status and tenant
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: 'occupied',
            currentTenantId: assignTenantDto.tenantId,
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return updatedRoom;
  }

  /**
   * Vacate room (remove tenant)
   */
  async vacateRoom(
    id: string,
    vacateRoomDto: VacateRoomDto,
    userId: string,
  ): Promise<Room> {
    // Verify ownership first
    const room = await this.findOne(id, userId);

    // Check if room has a tenant
    if (!room.currentTenantId) {
      throw new BadRequestException('Room does not have a tenant');
    }

    // Update room status and clear tenant
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        id,
        {
          $set: { status: 'vacant' },
          $unset: { currentTenantId: 1 },
        },
        { new: true },
      )
      .exec();

    if (!updatedRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return updatedRoom;
  }

  /**
   * Update current tenant info (embedded in room)
   * If all fields are null/empty, it will remove the tenant
   */
  async updateTenantInfo(
    id: string,
    updateTenantDto: UpdateTenantDto,
    userId: string,
  ): Promise<Room> {
    // Verify ownership first
    await this.findOne(id, userId);

    // Check if all fields are empty (means remove tenant)
    const isEmpty = !updateTenantDto.name && !updateTenantDto.phone && !updateTenantDto.moveInDate;

    let updatedRoom: Room | null;

    if (isEmpty) {
      // Remove tenant and set status to vacant
      updatedRoom = await this.roomModel
        .findByIdAndUpdate(
          id,
          {
            $set: { status: 'vacant' },
            $unset: { currentTenant: 1 },
          },
          { new: true },
        )
        .exec();
    } else {
      // Update tenant info and set status to occupied
      updatedRoom = await this.roomModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              status: 'occupied',
              currentTenant: {
                name: updateTenantDto.name,
                phone: updateTenantDto.phone,
                moveInDate: updateTenantDto.moveInDate,
              },
            },
          },
          { new: true },
        )
        .exec();
    }

    if (!updatedRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return updatedRoom;
  }

  /**
   * Remove current tenant from room
   */
  async removeTenant(id: string, userId: string): Promise<Room> {
    // Verify ownership first
    const room = await this.findOne(id, userId);

    // Check if room has a tenant
    if (!room.currentTenant) {
      throw new BadRequestException('Room does not have a tenant');
    }

    // Remove tenant and set status to vacant
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        id,
        {
          $set: { status: 'vacant' },
          $unset: { currentTenant: 1 },
        },
        { new: true },
      )
      .exec();

    if (!updatedRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return updatedRoom;
  }
}
