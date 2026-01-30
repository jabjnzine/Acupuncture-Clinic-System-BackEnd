import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PROMPTPAY = 'promptpay',
  INSURANCE = 'insurance',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // เลขที่ใบแจ้งหนี้
  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // วันที่ออกใบแจ้งหนี้
  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: Date;

  // รายการ
  @Column({ type: 'jsonb', default: '[]' })
  items: InvoiceItem[];

  // ยอดรวมก่อนส่วนลด
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  // ส่วนลด
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  // ประเภทส่วนลด
  @Column({ name: 'discount_type', nullable: true })
  discountType: 'fixed' | 'percentage';

  // ยอดรวมสุทธิ
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  // ยอดที่ชำระแล้ว
  @Column({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  // สถานะ
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  // อ้างอิงการรักษา
  @Column({ name: 'treatment_id', nullable: true })
  treatmentId: string;

  // อ้างอิงใบสั่งยา
  @Column({ name: 'prescription_id', nullable: true })
  prescriptionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Computed
  get balance(): number {
    return Number(this.total) - Number(this.paidAmount);
  }
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: 'treatment' | 'herb' | 'consultation' | 'other';
  referenceId?: string;
}
