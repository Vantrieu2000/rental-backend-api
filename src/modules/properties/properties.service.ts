import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyFiltersDto,
  PropertyStatisticsDto,
} from './dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,
  ) {}

  /**
   * Create a new property
   */
  async create(
    createPropertyDto: CreatePropertyDto,
    userId: string,
  ): Promise<Property> {
    const property = new this.propertyModel({
      ...createPropertyDto,
      ownerId: userId,
    });

    return property.save();
  }

  /**
   * Find all properties owned by the user
   */
  async findAll(
    filters: PropertyFiltersDto,
    userId: string,
  ): Promise<Property[]> {
    const query: any = { ownerId: userId };

    // Add search filter if provided
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return this.propertyModel.find(query).exec();
  }

  /**
   * Find one property by ID
   */
  async findOne(id: string, userId: string): Promise<Property> {
    const property = await this.propertyModel.findById(id).exec();

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Verify ownership
    if (property.ownerId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this property');
    }

    return property;
  }

  /**
   * Update a property
   */
  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
  ): Promise<Property> {
    // Verify ownership first
    await this.findOne(id, userId);

    const property = await this.propertyModel
      .findByIdAndUpdate(id, { $set: updatePropertyDto }, { new: true })
      .exec();

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  /**
   * Remove a property
   */
  async remove(id: string, userId: string): Promise<void> {
    // Verify ownership first
    await this.findOne(id, userId);

    // Check if property has rooms (will be implemented when Room module is ready)
    // For now, we'll just delete the property
    // TODO: Add room check when Room module is implemented

    const result = await this.propertyModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
  }

  /**
   * Get property statistics
   */
  async getStatistics(
    id: string,
    userId: string,
  ): Promise<PropertyStatisticsDto> {
    // Verify ownership first
    const property = await this.findOne(id, userId);

    // TODO: Calculate actual statistics from rooms and payments
    // For now, return mock data
    const statistics: PropertyStatisticsDto = {
      totalRooms: property.totalRooms,
      occupiedRooms: 0,
      vacantRooms: property.totalRooms,
      vacancyRate: 100,
      totalRevenue: 0,
      monthlyRevenue: 0,
    };

    return statistics;
  }
}
