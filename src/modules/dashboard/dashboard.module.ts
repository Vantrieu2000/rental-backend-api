import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Property, PropertySchema } from '../properties/schemas/property.schema';
import { Room, RoomSchema } from '../rooms/schemas/room.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: Room.name, schema: RoomSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
