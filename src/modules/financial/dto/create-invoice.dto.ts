import {
  IsString,
  IsArray,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsString()
  @IsOptional()
  category?: 'treatment' | 'herb' | 'consultation' | 'other';

  @IsString()
  @IsOptional()
  referenceId?: string;
}

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty({ message: 'กรุณาเลือกผู้ป่วย' })
  patientId: string;

  @IsDateString()
  @IsOptional()
  invoiceDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @IsString()
  @IsOptional()
  discountType?: 'fixed' | 'percentage';

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  treatmentId?: string;

  @IsUUID()
  @IsOptional()
  prescriptionId?: string;
}
