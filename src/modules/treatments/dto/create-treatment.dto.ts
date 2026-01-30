import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AcupointSelectionDto {
  @IsString()
  @IsNotEmpty()
  acupointId: string;

  @IsString()
  @IsNotEmpty()
  acupointCode: string;

  @IsString()
  @IsNotEmpty()
  acupointName: string;

  @IsString()
  @IsOptional()
  side?: 'left' | 'right' | 'bilateral' | 'center';

  @IsNumber()
  @IsOptional()
  depth?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ElectroSettingsDto {
  @IsNumber()
  @IsOptional()
  frequency?: number;

  @IsNumber()
  @IsOptional()
  intensity?: number;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  waveform?: string;
}

export class CreateTreatmentDto {
  @IsUUID()
  @IsNotEmpty({ message: 'กรุณาเลือกผู้ป่วย' })
  patientId: string;

  @IsUUID()
  @IsOptional()
  diagnosisId?: string;

  @IsDateString()
  @IsNotEmpty()
  treatmentDate: string;

  @IsString()
  @IsOptional()
  chiefComplaint?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcupointSelectionDto)
  @IsOptional()
  acupoints?: AcupointSelectionDto[];

  @IsString()
  @IsOptional()
  needleTechnique?: string;

  @IsNumber()
  @IsOptional()
  retentionTime?: number;

  @IsBoolean()
  @IsOptional()
  electroAcupuncture?: boolean;

  @ValidateNested()
  @Type(() => ElectroSettingsDto)
  @IsOptional()
  electroSettings?: ElectroSettingsDto;

  @IsBoolean()
  @IsOptional()
  tuina?: boolean;

  @IsBoolean()
  @IsOptional()
  cupping?: boolean;

  @IsBoolean()
  @IsOptional()
  moxibustion?: boolean;

  @IsBoolean()
  @IsOptional()
  guaSha?: boolean;

  @IsString()
  @IsOptional()
  treatmentNotes?: string;

  @IsString()
  @IsOptional()
  treatmentOutcome?: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  painLevelBefore?: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  painLevelAfter?: number;

  @IsUUID()
  @IsOptional()
  practitionerId?: string;
}
