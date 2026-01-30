import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice, PaymentMethod } from './invoice.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // เลขที่ใบเสร็จ
  @Column({ name: 'receipt_number', unique: true })
  receiptNumber: string;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  // จำนวนเงินที่ชำระ
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  // วิธีการชำระ
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  method: PaymentMethod;

  // วันที่ชำระ
  @Column({ name: 'payment_date', type: 'timestamp' })
  paymentDate: Date;

  // เลขอ้างอิง (เช่น เลขบัตรเครดิต หรือ transaction id)
  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  // ผู้รับเงิน
  @Column({ name: 'received_by', nullable: true })
  receivedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
