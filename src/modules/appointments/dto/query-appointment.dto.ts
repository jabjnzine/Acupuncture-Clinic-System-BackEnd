import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { AppointmentStatus } from '../entities/appointment.entity';

export class QueryAppointmentDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
