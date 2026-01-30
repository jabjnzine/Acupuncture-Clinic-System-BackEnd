import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('package_usages')
export class PackageUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // แพ็คเกจของผู้ป่วย (เก็บ ID ตรงๆ ไม่ใช้ FK)
  @Column({ name: 'patient_package_id', type: 'uuid' })
  patientPackageId: string;

  // การรักษาที่เกี่ยวข้อง (optional)
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
