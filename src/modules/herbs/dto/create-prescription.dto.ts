import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @IsUUID()
  @IsNotEmpty()
  herbId: string;

  @IsString()
  @IsNotEmpty()
  herbCode: string;

  @IsString()
  @IsNotEmpty()
  herbName: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePrescriptionDto {
  @IsUUID()
  @IsNotEmpty({ message: 'กรุณาเลือกผู้ป่วย' })
  patientId: string;

  @IsUUID()
  @IsOptional()
  formulaId?: string;

  @IsDateString()
  @IsNotEmpty()
  prescriptionDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  quantitySets?: number;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  practitionerId?: string;
}
