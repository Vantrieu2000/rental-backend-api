import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new user
   * Validates email uniqueness and hashes password automatically via schema hook
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Check if email already exists
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Create new user - password will be hashed by pre-save hook
      const createdUser = new this.userModel({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
      });

      const savedUser = await createdUser.save();

      // Return user without password
      return this.toUserResponse(savedUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      // Handle MongoDB duplicate key error (E11000)
      if ((error as any).code === 11000) {
        throw new ConflictException('Email already exists');
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Find a user by ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserResponse(user);
  }

  /**
   * Find a user by email
   * Returns the full user document including password (for authentication)
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Update a user
   * Note: Password updates should be handled separately with proper validation
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: updateUserDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserResponse(user);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } })
      .exec();
  }

  /**
   * Convert user document to response DTO (excludes password)
   */
  private toUserResponse(user: UserDocument): UserResponseDto {
    const userObject = user.toObject();
    const response = plainToInstance(UserResponseDto, userObject, {
      excludeExtraneousValues: true,
    });
    // plainToInstance returns an array when given an array, but we're passing a single object
    return Array.isArray(response) ? response[0] : response;
  }
}
