import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';

export class QueryDiagnosisDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;
}
