import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  Min,
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class MarkPaidDto {
  @ApiProperty({
    description: 'Amount paid (VND)',
    example: 3600000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Paid amount must be at least 0' })
  paidAmount: number;

  @ApiProperty({
    description: 'Payment date',
    example: '2024-01-05',
  })
  @IsDateString({}, { message: 'Invalid date format' })
  @IsNotEmpty({ message: 'Payment date is required' })
  paidDate: string;

  @ApiProperty({
    description: 'Payment method',
    enum: ['cash', 'bank_transfer', 'e_wallet'],
    example: 'bank_transfer',
  })
  @IsEnum(['cash', 'bank_transfer', 'e_wallet'], {
    message: 'Payment method must be one of: cash, bank_transfer, e_wallet',
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'Notes',
    required: false,
    example: 'Paid via bank transfer',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
