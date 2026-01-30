import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  IsString,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsDateString()
  @IsNotEmpty()
  expenseDate: string;

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรายละเอียด' })
  description: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
