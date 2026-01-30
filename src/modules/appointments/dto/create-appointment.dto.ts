import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty({ message: 'กรุณาเลือกผู้ป่วย' })
  patientId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'กรุณาระบุวันนัด' })
  appointmentDate: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุเวลานัด' })
  startTime: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  practitionerId?: string;
}
