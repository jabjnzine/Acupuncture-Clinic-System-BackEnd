import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNotEmpty,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../entities/patient.entity';

export class CreatePatientDto {
  // Optional: ใช้สำหรับ import รหัสเดิม ถ้าไม่ระบุระบบจะสร้างให้อัตโนมัติ
  @IsString()
  @IsOptional()
  @MaxLength(20)
  hnNumber?: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกนามสกุล' })
  @MaxLength(100)
  lastName: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  idNumber?: string;

  @IsString()
  @IsOptional()
  idType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nationality?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nickname?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  emergencyPhone?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  allergies?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  chronicDiseases?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  currentMedications?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
