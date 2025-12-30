import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantFiltersDto,
  AssignTenantDto,
  VacateTenantDto,
} from './dto';
import { Tenant } from './schemas/tenant.schema';
import { TenantHistory } from './schemas/tenant-history.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully',
    type: Tenant,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Tenant> {
    return this.tenantsService.create(createTenantDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({
    status: 200,
    description: 'Tenants retrieved successfully',
    type: [Tenant],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() filters: TenantFiltersDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Tenant[]> {
    return this.tenantsService.findAll(filters, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant retrieved successfully',
    type: Tenant,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Tenant> {
    return this.tenantsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
    type: Tenant,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Tenant> {
    return this.tenantsService.update(id, updateTenantDto, user.userId);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign tenant to a new room' })
  @ApiResponse({
    status: 200,
    description: 'Tenant assigned successfully',
    type: Tenant,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async assign(
    @Param('id') id: string,
    @Body() assignTenantDto: AssignTenantDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Tenant> {
    return this.tenantsService.assignToRoom(id, assignTenantDto, user.userId);
  }

  @Post(':id/vacate')
  @ApiOperation({ summary: 'Vacate tenant from room' })
  @ApiResponse({
    status: 200,
    description: 'Tenant vacated successfully',
    type: Tenant,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async vacate(
    @Param('id') id: string,
    @Body() vacateTenantDto: VacateTenantDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Tenant> {
    return this.tenantsService.vacate(id, vacateTenantDto, user.userId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get tenant history' })
  @ApiResponse({
    status: 200,
    description: 'Tenant history retrieved successfully',
    type: [TenantHistory],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getHistory(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<TenantHistory[]> {
    return this.tenantsService.getHistory(id, user.userId);
  }
}
