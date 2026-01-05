import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'Payment status',
    enum: ['paid', 'unpaid'],
    example: 'paid',
  })
  @IsEnum(['paid', 'unpaid'], {
    message: 'Status must be one of: paid, unpaid',
  })
  status: 'paid' | 'unpaid';

  @ApiProperty({
    description: 'Payment method',
    enum: ['cash', 'bank_transfer', 'e_wallet'],
    required: false,
    example: 'bank_transfer',
  })
  @IsOptional()
  @IsEnum(['cash', 'bank_transfer', 'e_wallet'], {
    message: 'Payment method must be one of: cash, bank_transfer, e_wallet',
  })
  paymentMethod?: string;

  @ApiProperty({
    description: 'Notes',
    required: false,
    example: 'Paid via bank transfer',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
