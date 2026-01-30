import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateProgressDto {
  @IsUUID()
  @IsNotEmpty({ message: 'กรุณาเลือกผู้ป่วย' })
  patientId: string;

  @IsUUID()
  @IsOptional()
  treatmentId?: string;

  @IsDateString()
  @IsOptional()
  recordDate?: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  painLevel?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  functionLevel?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  qualityOfLife?: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  sleepQuality?: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  energyLevel?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  improvedSymptoms?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  remainingSymptoms?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  newSymptoms?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sideEffects?: string[];

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  satisfactionRating?: number;

  @IsString()
  @IsOptional()
  patientNotes?: string;

  @IsString()
  @IsOptional()
  practitionerNotes?: string;

  @IsString()
  @IsOptional()
  treatmentRecommendation?: string;
}
