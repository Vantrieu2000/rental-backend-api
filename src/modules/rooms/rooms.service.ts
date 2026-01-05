import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { PropertiesService } from '../properties/properties.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentGenerationService } from '../payments/payment-generation.service';
import {
  CreateRoomDto,
  UpdateRoomDto,
  RoomFiltersDto,
  AssignTenantDto,
  VacateRoomDto,
  PaymentStatusInfo,
  UpdatePaymentStatusOptions,
} from './dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private propertiesService: PropertiesService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
    private paymentGenerationService: PaymentGenerationService,
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
    const existingRoom = await this.findOne(id, userId);

    // Check if all fields are empty (means remove tenant)
    const isEmpty = !updateTenantDto.name && !updateTenantDto.phone && !updateTenantDto.moveInDate && !updateTenantDto.paymentDueDay;

    let updatedRoom: Room | null;
    const isNewTenant = !existingRoom.currentTenant;

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
                paymentDueDay: updateTenantDto.paymentDueDay,
              },
            },
          },
          { new: true },
        )
        .exec();

      // If this is a new tenant assignment, create initial bill
      if (isNewTenant && updatedRoom) {
        try {
          await this.paymentGenerationService.createPaymentRecord(
            updatedRoom as any,
            new Date()
          );
        } catch (error) {
          console.error('[RoomsService] Failed to create initial bill:', error);
        }
      }

      // If paymentDueDay changed, update the dueDate of current payment record
      if (
        updateTenantDto.paymentDueDay &&
        existingRoom.currentTenant?.paymentDueDay !== updateTenantDto.paymentDueDay
      ) {
        try {
          const latestPayment = await this.paymentsService.getLatestPaymentForRoom(id);
          
          if (latestPayment) {
            // Calculate new due date based on payment's billing period and new paymentDueDay
            const newDueDate = new Date(
              latestPayment.billingYear,
              latestPayment.billingMonth - 1, // JavaScript months are 0-indexed
              updateTenantDto.paymentDueDay
            );

            // Update payment's dueDate
            await this.paymentsService.updatePaymentDueDate(
              (latestPayment as any)._id.toString(),
              newDueDate
            );
          }
        } catch (error) {
          // Log error but don't fail the tenant update
          console.error('Failed to update payment dueDate:', error);
        }
      }
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

  /**
   * Calculate payment status for a room
   */
  async calculatePaymentStatus(roomId: string): Promise<PaymentStatusInfo> {
    const room = await this.roomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // If room is vacant, return no_payment status
    if (room.status !== 'occupied') {
      return {
        status: 'no_payment',
        dueDate: null,
        amount: null,
        paidAmount: null,
        latestPaymentId: null,
      };
    }

    // Get latest payment for room
    const latestPayment = await this.paymentsService.getLatestPaymentForRoom(
      roomId,
    );

    // If no payment records exist
    if (!latestPayment) {
      return {
        status: 'no_payment',
        dueDate: null,
        amount: null,
        paidAmount: null,
        latestPaymentId: null,
      };
    }

    // Check if payment is from current billing period
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // If latest payment is before current billing period
    if (
      latestPayment.billingYear < currentYear ||
      (latestPayment.billingYear === currentYear &&
        latestPayment.billingMonth < currentMonth)
    ) {
      return {
        status: 'unpaid',
        dueDate: latestPayment.dueDate,
        amount: latestPayment.totalAmount,
        paidAmount: latestPayment.paidAmount,
        latestPaymentId: (latestPayment as any)._id.toString(),
      };
    }

    // Check if payment is overdue
    if (
      latestPayment.dueDate < now &&
      latestPayment.status !== 'paid'
    ) {
      return {
        status: 'overdue',
        dueDate: latestPayment.dueDate,
        amount: latestPayment.totalAmount,
        paidAmount: latestPayment.paidAmount,
        latestPaymentId: (latestPayment as any)._id.toString(),
      };
    }

    // Return the current payment status
    return {
      status: latestPayment.status as any,
      dueDate: latestPayment.dueDate,
      amount: latestPayment.totalAmount,
      paidAmount: latestPayment.paidAmount,
      latestPaymentId: (latestPayment as any)._id.toString(),
    };
  }

  /**
   * Find all rooms with payment status
   */
  async findAllWithPaymentStatus(
    filters: RoomFiltersDto,
    userId: string,
  ): Promise<any> {
    const roomsResult = await this.findAll(filters, userId);

    // Calculate payment status for each occupied room
    const roomsWithStatus = await Promise.all(
      roomsResult.data.map(async (room) => {
        let paymentStatus: PaymentStatusInfo | null = null;

        if (room.status === 'occupied') {
          try {
            paymentStatus = await this.calculatePaymentStatus(
              (room as any)._id.toString(),
            );
          } catch (error) {
            // If error calculating status, set to no_payment
            paymentStatus = {
              status: 'no_payment',
              dueDate: null,
              amount: null,
              paidAmount: null,
              latestPaymentId: null,
            };
          }
        } else {
          paymentStatus = {
            status: 'no_payment',
            dueDate: null,
            amount: null,
            paidAmount: null,
            latestPaymentId: null,
          };
        }

        return {
          ...(room as any).toObject(),
          paymentStatus,
        };
      }),
    );

    return {
      ...roomsResult,
      data: roomsWithStatus,
    };
  }

  /**
   * Update payment status for a room
   */
  async updatePaymentStatus(
    roomId: string,
    status: 'paid' | 'unpaid',
    options?: UpdatePaymentStatusOptions,
    userId?: string,
  ): Promise<Room> {
    // Verify ownership if userId provided
    if (userId) {
      await this.findOne(roomId, userId);
    }

    const room = await this.roomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Validate room is occupied
    if (room.status !== 'occupied') {
      throw new BadRequestException('Room is not occupied');
    }

    // Get latest payment for current billing period
    const latestPayment = await this.paymentsService.getLatestPaymentForRoom(
      roomId,
    );

    if (!latestPayment) {
      throw new NotFoundException(
        'No payment record found for current billing period',
      );
    }

    // Update payment based on status
    if (status === 'paid') {
      await this.paymentsService.updatePaymentStatus(
        (latestPayment as any)._id.toString(),
        {
          status: 'paid',
          paidAmount: latestPayment.totalAmount,
          paidDate: new Date(),
          paymentMethod: options?.paymentMethod,
          notes: options?.notes,
        },
      );
    } else if (status === 'unpaid') {
      await this.paymentsService.updatePaymentStatus(
        (latestPayment as any)._id.toString(),
        {
          status: 'unpaid',
          paidAmount: 0,
          paidDate: null,
          paymentMethod: options?.paymentMethod,
          notes: options?.notes,
        },
      );
    }

    return room;
  }
}
