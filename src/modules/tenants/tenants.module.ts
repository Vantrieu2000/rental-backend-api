import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import {
  TenantHistory,
  TenantHistorySchema,
} from './schemas/tenant-history.schema';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: TenantHistory.name, schema: TenantHistorySchema },
    ]),
    forwardRef(() => RoomsModule),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
