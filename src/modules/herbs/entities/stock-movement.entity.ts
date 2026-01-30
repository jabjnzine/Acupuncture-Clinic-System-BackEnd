import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Herb } from './herb.entity';

export enum StockMovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'herb_id' })
  herbId: string;

  @ManyToOne(() => Herb)
  @JoinColumn({ name: 'herb_id' })
  herb: Herb;

  // ประเภทการเคลื่อนไหว
  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  // จำนวน (+ หรือ -)
  @Column({ type: 'float' })
  quantity: number;

  // สต๊อกก่อนทำรายการ
  @Column({ name: 'stock_before', type: 'float' })
  stockBefore: number;

  // สต๊อกหลังทำรายการ
  @Column({ name: 'stock_after', type: 'float' })
  stockAfter: number;

  // ราคาต่อหน่วย (สำหรับ stock in)
  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost: number;

  // เหตุผล
  @Column({ nullable: true })
  reason: string;

  // เอกสารอ้างอิง (เช่น เลขที่ใบสั่งซื้อ, เลขที่ใบสั่งยา)
  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  // ผู้ทำรายการ
  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
