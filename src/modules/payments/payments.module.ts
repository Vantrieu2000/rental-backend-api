import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentGenerationService } from './payment-generation.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { RoomsModule } from '../rooms/rooms.module';
import { TenantsModule } from '../tenants/tenants.module';
import { PropertiesModule } from '../properties/properties.module';
import { Room, RoomSchema } from '../rooms/schemas/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
    forwardRef(() => RoomsModule),
    TenantsModule,
    PropertiesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentGenerationService],
  exports: [PaymentsService, PaymentGenerationService],
})
export class PaymentsModule {}
