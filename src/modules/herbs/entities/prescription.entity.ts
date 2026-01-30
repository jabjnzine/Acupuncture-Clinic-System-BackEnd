import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { HerbalFormula } from './herbal-formula.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // เลขที่ใบสั่งยา
  @Column({ name: 'prescription_number', unique: true })
  prescriptionNumber: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // ตำรับที่ใช้ (optional - อาจเป็นยาเดี่ยว)
  @Column({ name: 'formula_id', nullable: true })
  formulaId: string;

  @ManyToOne(() => HerbalFormula)
  @JoinColumn({ name: 'formula_id' })
  formula: HerbalFormula;

  // วันที่สั่งยา
  @Column({ name: 'prescription_date', type: 'date' })
  prescriptionDate: Date;

  // รายการยา (JSON)
  @Column({ type: 'jsonb', default: '[]' })
  items: PrescriptionItem[];

  // จำนวนชุด
  @Column({ name: 'quantity_sets', default: 1 })
  quantitySets: number;

  // วิธีใช้
  @Column({ type: 'text', nullable: true })
  instructions: string;

  // ระยะเวลาใช้ยา (วัน)
  @Column({ nullable: true })
  duration: number;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  // ราคารวม
  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  // สถานะ
  @Column({ default: 'pending' })
  status: 'pending' | 'dispensed' | 'cancelled';

  // แพทย์ผู้สั่ง
  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export interface PrescriptionItem {
  herbId: string;
  herbCode: string;
  herbName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}
