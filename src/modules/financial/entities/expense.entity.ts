import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ExpenseCategory {
  SUPPLIES = 'supplies',
  HERBS = 'herbs',
  EQUIPMENT = 'equipment',
  RENT = 'rent',
  UTILITIES = 'utilities',
  SALARY = 'salary',
  MARKETING = 'marketing',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // วันที่
  @Column({ name: 'expense_date', type: 'date' })
  expenseDate: Date;

  // หมวดหมู่
  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    default: ExpenseCategory.OTHER,
  })
  category: ExpenseCategory;

  // รายละเอียด
  @Column()
  description: string;

  // จำนวนเงิน
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  // ผู้จ่าย/vendor
  @Column({ nullable: true })
  vendor: string;

  // เลขที่เอกสาร/ใบเสร็จ
  @Column({ name: 'receipt_number', nullable: true })
  receiptNumber: string;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  // ผู้บันทึก
  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
