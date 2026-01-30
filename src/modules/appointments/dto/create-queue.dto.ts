import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateQueueDto {
  @IsUUID()
  @IsNotEmpty({ message: 'กรุณาเลือกผู้ป่วย' })
  patientId: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @IsDateString()
  @IsOptional()
  queueDate?: string;

  @IsString()
  @IsOptional()
  queuePrefix?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsString()
  @IsOptional()
  servicePoint?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
