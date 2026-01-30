import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { StockMovementType } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
  @IsUUID()
  @IsNotEmpty()
  herbId: string;

  @IsEnum(StockMovementType)
  @IsNotEmpty()
  type: StockMovementType;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsOptional()
  unitCost?: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
