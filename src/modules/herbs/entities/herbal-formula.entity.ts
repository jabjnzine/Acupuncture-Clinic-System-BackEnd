import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('herbal_formulas')
export class HerbalFormula {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // รหัสตำรับ
  @Column({ unique: true })
  code: string;

  @Column({ name: 'name_th' })
  nameTh: string;

  @Column({ name: 'name_en', nullable: true })
  nameEn: string;

  @Column({ name: 'name_cn', nullable: true })
  nameCn: string;

  // หมวดหมู่
  @Column({ nullable: true })
  category: string;

  // ส่วนประกอบ (JSON array)
  @Column({ type: 'jsonb', default: '[]' })
  ingredients: FormulaIngredient[];

  // สรรพคุณ
  @Column({ type: 'text', nullable: true })
  properties: string;

  // ข้อบ่งใช้
  @Column('text', { array: true, default: '{}' })
  indications: string[];

  // ข้อห้ามใช้
  @Column('text', { array: true, default: '{}' })
  contraindications: string[];

  // วิธีใช้
  @Column({ type: 'text', nullable: true })
  instructions: string;

  // ราคาต่อชุด
  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export interface FormulaIngredient {
  herbId: string;
  herbCode: string;
  herbName: string;
  quantity: number;
  unit: string;
  role?: 'king' | 'minister' | 'assistant' | 'guide'; // จุน ฉิน จว้อ สื่อ
  notes?: string;
}
