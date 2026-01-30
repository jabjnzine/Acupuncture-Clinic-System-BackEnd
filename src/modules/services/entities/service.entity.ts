import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ServiceCategory {
  TREATMENT = 'treatment',
  CONSULTATION = 'consultation',
  OTHER = 'other',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // รหัสบริการ
  @Column({ unique: true })
  code: string;

  // ชื่อบริการ
  @Column()
  name: string;

  // รายละเอียด
  @Column({ type: 'text', nullable: true })
  description: string;

  // ราคา
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  // หมวดหมู่
  @Column({
    type: 'enum',
    enum: ServiceCategory,
    default: ServiceCategory.TREATMENT,
  })
  category: ServiceCategory;

  // ระยะเวลา (นาที)
  @Column({ nullable: true })
  duration: number;

  // สถานะ
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
