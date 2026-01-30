import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PatientPackage } from './patient-package.entity';

@Entity('package_usages')
export class PackageUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // แพ็คเกจของผู้ป่วย (FK relation)
  @ManyToOne(() => PatientPackage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_package_id' })
  patientPackage: PatientPackage;

  // การรักษาที่เกี่ยวข้อง (optional, ไม่ต้อง FK เพราะอาจไม่มี treatment)
  @Column({ name: 'treatment_id', type: 'uuid', nullable: true })
  treatmentId?: string;

  // วันที่ใช้
  @Column({ name: 'usage_date', type: 'date' })
  usageDate: Date;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

