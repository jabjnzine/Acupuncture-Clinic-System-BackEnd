import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('herbs')
export class Herb {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // รหัสสมุนไพร
  @Column({ unique: true })
  code: string;

  @Column({ name: 'name_th' })
  nameTh: string;

  @Column({ name: 'name_en', nullable: true })
  nameEn: string;

  @Column({ name: 'name_cn', nullable: true })
  nameCn: string;

  // ชื่อวิทยาศาสตร์
  @Column({ name: 'scientific_name', nullable: true })
  scientificName: string;

  // หมวดหมู่ตามการแพทย์แผนจีน
  @Column({ nullable: true })
  category: string;

  // รสตามแพทย์แผนจีน (เปรี้ยว หวาน ขม เผ็ด เค็ม)
  @Column({ nullable: true })
  taste: string;

  // อุณหภูมิ (ร้อน อุ่น เย็น หนาว กลาง)
  @Column({ nullable: true })
  temperature: string;

  // เส้นลมที่เข้าถึง
  @Column('text', { array: true, default: '{}' })
  meridians: string[];

  // สรรพคุณ
  @Column({ type: 'text', nullable: true })
  properties: string;

  // ข้อบ่งใช้
  @Column('text', { array: true, default: '{}' })
  indications: string[];

  // ข้อห้ามใช้
  @Column('text', { array: true, default: '{}' })
  contraindications: string[];

  // ขนาดใช้ (กรัม)
  @Column({ name: 'dosage_min', type: 'float', nullable: true })
  dosageMin: number;

  @Column({ name: 'dosage_max', type: 'float', nullable: true })
  dosageMax: number;

  // หน่วย
  @Column({ default: 'กรัม' })
  unit: string;

  // ราคาต่อหน่วย
  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  // สต๊อกปัจจุบัน
  @Column({ name: 'stock_quantity', type: 'float', default: 0 })
  stockQuantity: number;

  // จุด reorder
  @Column({ name: 'reorder_level', type: 'float', default: 100 })
  reorderLevel: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
