import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsBoolean,
  Min,
  IsDateString,
} from 'class-validator';

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsNumber()
  @Min(1)
  totalSessions: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  validDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalSessions?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  validDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreatePatientPackageDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  packageId: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsUUID()
  @IsOptional()
  invoiceId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UsePackageSessionDto {
  @IsUUID()
  patientPackageId: string;

  @IsUUID()
  @IsOptional()
  treatmentId?: string;

  @IsDateString()
  @IsOptional()
  usageDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
