import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('acupoints')
export class Acupoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // รหัสจุดฝังเข็ม (เช่น LI4, ST36)
  @Column({ unique: true })
  code: string;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'name_th' })
  nameTh: string;

  @Column({ name: 'name_cn', nullable: true })
  nameCn: string;

  // เส้นลม (Meridian)
  @Column()
  meridian: string;

  // ตำแหน่งบนร่างกาย
  @Column({ name: 'body_region' })
  bodyRegion: string;

  // คำอธิบายตำแหน่ง
  @Column({ name: 'location_description', type: 'text', nullable: true })
  locationDescription: string;

  // พิกัดสำหรับแสดงบนแผนภาพ (x, y coordinates)
  @Column({ name: 'diagram_x', type: 'float', nullable: true })
  diagramX: number;

  @Column({ name: 'diagram_y', type: 'float', nullable: true })
  diagramY: number;

  // ด้านของร่างกาย (front, back, side)
  @Column({ name: 'body_view', nullable: true })
  bodyView: string;

  // URL รูปภาพ (WHO standard)
  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  // ข้อบ่งใช้
  @Column('text', { array: true, default: '{}' })
  indications: string[];

  // ข้อห้ามใช้
  @Column('text', { array: true, default: '{}', name: 'contraindications' })
  contraindications: string[];

  // ความลึกในการฝังเข็ม (cun)
  @Column({ name: 'needle_depth', nullable: true })
  needleDepth: string;

  // เทคนิคพิเศษ
  @Column({ name: 'special_technique', nullable: true })
  specialTechnique: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
