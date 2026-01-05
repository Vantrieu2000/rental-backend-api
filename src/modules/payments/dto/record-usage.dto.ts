import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecordUsageDto {
  @IsNumber()
  @Min(0, { message: 'Electricity usage must be non-negative' })
  electricityUsage: number;

  @IsNumber()
  @Min(0, { message: 'Water usage must be non-negative' })
  waterUsage: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  previousElectricityReading?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentElectricityReading?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  previousWaterReading?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentWaterReading?: number;

  @IsNumber()
  @IsOptional()
  adjustments?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
