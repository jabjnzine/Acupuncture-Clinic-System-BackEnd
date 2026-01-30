import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Package } from './package.entity';

export enum PatientPackageStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('patient_packages')
export class PatientPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ผู้ป่วย
  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // แพ็คเกจ
  @Column({ name: 'package_id' })
  packageId: string;

  @ManyToOne(() => Package)
  @JoinColumn({ name: 'package_id' })
  package: Package;

  // วันที่ซื้อ
  @Column({ name: 'purchase_date', type: 'date' })
  purchaseDate: Date;

  // วันหมดอายุ
  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate: Date;

  // จำนวนครั้งทั้งหมด
  @Column({ name: 'total_sessions' })
  totalSessions: number;

  // จำนวนครั้งที่ใช้ไปแล้ว
  @Column({ name: 'used_sessions', default: 0 })
  usedSessions: number;

  // สถานะ
  @Column({
    type: 'enum',
    enum: PatientPackageStatus,
    default: PatientPackageStatus.ACTIVE,
  })
  status: PatientPackageStatus;

  // ใบแจ้งหนี้ที่เกี่ยวข้อง
  @Column({ name: 'invoice_id', nullable: true })
  invoiceId: string;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Computed
  get remainingSessions(): number {
    return this.totalSessions - this.usedSessions;
  }
}

