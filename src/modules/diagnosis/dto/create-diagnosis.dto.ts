import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateDiagnosisDto {
  @IsUUID()
  @IsNotEmpty({ message: 'กรุณาเลือกผู้ป่วย' })
  patientId: string;

  @IsDateString()
  @IsNotEmpty()
  visitDate: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกอาการหลัก' })
  chiefComplaint: string;

  @IsString()
  @IsOptional()
  pulseLeft?: string;

  @IsString()
  @IsOptional()
  pulseRight?: string;

  @IsNumber()
  @IsOptional()
  pulseRate?: number;

  @IsString()
  @IsOptional()
  pulseQuality?: string;

  @IsString()
  @IsOptional()
  tongueBodyColor?: string;

  @IsString()
  @IsOptional()
  tongueCoating?: string;

  @IsString()
  @IsOptional()
  tongueShape?: string;

  @IsString()
  @IsOptional()
  tongueMoisture?: string;

  @IsString()
  @IsOptional()
  elementPattern?: string;

  @IsString()
  @IsOptional()
  syndrome?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  meridians?: string[];

  @IsString()
  @IsOptional()
  secondarySymptoms?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  practitionerId?: string;
}
