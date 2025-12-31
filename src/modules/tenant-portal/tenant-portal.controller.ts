import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantPortalService } from './tenant-portal.service';
import { CheckPaymentDto } from './dto';

@ApiTags('Tenant Portal')
@Controller('tenant-portal')
export class TenantPortalController {
  constructor(private readonly tenantPortalService: TenantPortalService) {}

  @Post('check-payment')
  @ApiOperation({ summary: 'Check payment information by phone number' })
  @ApiResponse({
    status: 200,
    description: 'Payment information retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No rooms found with this phone number' })
  async checkPayment(@Body() checkPaymentDto: CheckPaymentDto) {
    return this.tenantPortalService.checkPaymentByPhone(checkPaymentDto);
  }
}
