import { PartialType } from '@nestjs/mapped-types';
import { CreateHerbDto } from './create-herb.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateHerbDto extends PartialType(CreateHerbDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
