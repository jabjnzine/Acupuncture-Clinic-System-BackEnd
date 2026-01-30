import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateHerbDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสสมุนไพร' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อสมุนไพร' })
  nameTh: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  nameCn?: string;

  @IsString()
  @IsOptional()
  scientificName?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  taste?: string;

  @IsString()
  @IsOptional()
  temperature?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  meridians?: string[];

  @IsString()
  @IsOptional()
  properties?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  indications?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  contraindications?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  dosageMin?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  dosageMax?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockQuantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reorderLevel?: number;
}
