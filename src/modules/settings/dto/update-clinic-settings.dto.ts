import { IsString, IsEmail, IsBoolean, IsOptional, ValidateIf } from 'class-validator';

export class UpdateClinicSettingsDto {
  @IsString()
  @IsOptional()
  clinicName?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsBoolean()
  @IsOptional()
  notifyAppointment?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyLowStock?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyPendingPayment?: boolean;
}
