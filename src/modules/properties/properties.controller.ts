import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyFiltersDto,
  PropertyStatisticsDto,
} from './dto';
import { Property } from './schemas/property.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new property' })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    type: Property,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Property> {
    return this.propertiesService.create(createPropertyDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
    type: [Property],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() filters: PropertyFiltersDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Property[]> {
    return this.propertiesService.findAll(filters, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiResponse({
    status: 200,
    description: 'Property retrieved successfully',
    type: Property,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Property> {
    return this.propertiesService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property' })
  @ApiResponse({
    status: 200,
    description: 'Property updated successfully',
    type: Property,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Property> {
    return this.propertiesService.update(id, updatePropertyDto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete property' })
  @ApiResponse({ status: 204, description: 'Property deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    return this.propertiesService.remove(id, user.userId);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get property statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: PropertyStatisticsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getStatistics(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<PropertyStatisticsDto> {
    return this.propertiesService.getStatistics(id, user.userId);
  }
}
