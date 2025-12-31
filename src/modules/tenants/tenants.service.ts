import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import {
  TenantHistory,
  TenantHistoryDocument,
} from './schemas/tenant-history.schema';
import { RoomsService } from '../rooms/rooms.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantFiltersDto,
  AssignTenantDto,
  VacateTenantDto,
} from './dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(TenantHistory.name)
    private tenantHistoryModel: Model<TenantHistoryDocument>,
    private roomsService: RoomsService,
  ) {}

  /**
   * Create a new tenant
   */
  async create(
    createTenantDto: CreateTenantDto,
    userId: string,
  ): Promise<Tenant> {
    // Verify room exists and user owns it
    await this.roomsService.findOne(createTenantDto.roomId, userId);

    const tenant = new this.tenantModel(createTenantDto);
    const savedTenant = await tenant.save();

    // Create history record
    await this.createHistoryRecord(
      savedTenant._id.toString(),
      createTenantDto.roomId,
      new Date(createTenantDto.moveInDate),
    );

    return savedTenant;
  }

  /**
   * Find all tenants with filters
   */
  async findAll(
    filters: TenantFiltersDto,
    userId: string,
  ): Promise<Tenant[]> {
    const query: any = {};

    // If roomId filter is provided, verify ownership
    if (filters.roomId) {
      await this.roomsService.findOne(filters.roomId, userId);
      query.roomId = filters.roomId;
    } else {
      // Get all rooms owned by user
      const roomsResponse = await this.roomsService.findAll({}, userId);
      const roomIds = roomsResponse.data.map((r: any) => r._id);
      query.roomId = { $in: roomIds };
    }

    // Add active filter
    if (filters.active !== undefined) {
      if (filters.active) {
        query.moveOutDate = { $exists: false };
      } else {
        query.moveOutDate = { $exists: true };
      }
    }

    // Add search filter
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return this.tenantModel.find(query).populate('roomId').exec();
  }

  /**
   * Find one tenant by ID
   */
  async findOne(id: string, userId: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id).populate('roomId').exec();

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    // Verify ownership through room
    await this.roomsService.findOne(tenant.roomId.toString(), userId);

    return tenant;
  }

  /**
   * Update a tenant
   */
  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
    userId: string,
  ): Promise<Tenant> {
    // Verify ownership first
    await this.findOne(id, userId);

    const tenant = await this.tenantModel
      .findByIdAndUpdate(id, { $set: updateTenantDto }, { new: true })
      .exec();

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  /**
   * Assign tenant to a new room
   */
  async assignToRoom(
    id: string,
    assignTenantDto: AssignTenantDto,
    userId: string,
  ): Promise<Tenant> {
    // Verify ownership first
    const tenant = await this.findOne(id, userId);

    // Verify new room exists and user owns it
    await this.roomsService.findOne(assignTenantDto.roomId, userId);

    // Check if tenant already has an active assignment
    if (!tenant.moveOutDate) {
      throw new BadRequestException(
        'Tenant must vacate current room before being assigned to a new one',
      );
    }

    // Update tenant's room
    const updatedTenant = await this.tenantModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            roomId: assignTenantDto.roomId,
            moveInDate: new Date(assignTenantDto.moveInDate),
          },
          $unset: { moveOutDate: 1 },
        },
        { new: true },
      )
      .exec();

    if (!updatedTenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    // Create new history record
    await this.createHistoryRecord(
      id,
      assignTenantDto.roomId,
      new Date(assignTenantDto.moveInDate),
    );

    return updatedTenant;
  }

  /**
   * Vacate tenant from room
   */
  async vacate(
    id: string,
    vacateTenantDto: VacateTenantDto,
    userId: string,
  ): Promise<Tenant> {
    // Verify ownership first
    const tenant = await this.findOne(id, userId);

    // Check if tenant is already vacated
    if (tenant.moveOutDate) {
      throw new BadRequestException('Tenant has already vacated');
    }

    // Update tenant's move-out date
    const updatedTenant = await this.tenantModel
      .findByIdAndUpdate(
        id,
        { $set: { moveOutDate: new Date(vacateTenantDto.moveOutDate) } },
        { new: true },
      )
      .exec();

    if (!updatedTenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    // Update history record
    await this.updateHistoryRecord(
      id,
      tenant.roomId.toString(),
      new Date(vacateTenantDto.moveOutDate),
    );

    return updatedTenant;
  }

  /**
   * Get tenant history
   */
  async getHistory(id: string, userId: string): Promise<TenantHistory[]> {
    // Verify ownership first
    await this.findOne(id, userId);

    return this.tenantHistoryModel
      .find({ tenantId: id })
      .populate('roomId')
      .sort({ moveInDate: -1 })
      .exec();
  }

  /**
   * Create a history record
   */
  private async createHistoryRecord(
    tenantId: string,
    roomId: string,
    moveInDate: Date,
  ): Promise<void> {
    const history = new this.tenantHistoryModel({
      tenantId,
      roomId,
      moveInDate,
    });
    await history.save();
  }

  /**
   * Update history record with move-out date
   */
  private async updateHistoryRecord(
    tenantId: string,
    roomId: string,
    moveOutDate: Date,
  ): Promise<void> {
    await this.tenantHistoryModel
      .findOneAndUpdate(
        { tenantId, roomId, moveOutDate: { $exists: false } },
        { $set: { moveOutDate } },
      )
      .exec();
  }
}
