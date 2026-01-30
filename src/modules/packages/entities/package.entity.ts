import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ชื่อแพ็คเกจ
  @Column()
  name: string;

  // รายละเอียด
  @Column({ type: 'text', nullable: true })
  description: string;

  // บริการที่เกี่ยวข้อง
  @Column({ name: 'service_id', nullable: true })
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // จำนวนครั้งทั้งหมด
  @Column({ name: 'total_sessions' })
  totalSessions: number;

  // ราคาแพ็คเกจ
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  // อายุแพ็คเกจ (วัน)
  @Column({ name: 'valid_days', default: 180 })
  validDays: number;

  // สถานะ
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
