import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export enum FileType {
  PATIENT_DOCUMENT = 'patient_document',
  PRESCRIPTION_PDF = 'prescription_pdf',
  INVOICE_PDF = 'invoice_pdf',
  REPORT_PDF = 'report_pdf',
  MEDICAL_RECORD = 'medical_record',
  CONSENT_FORM = 'consent_form',
  IMAGE = 'image',
  OTHER = 'other',
}

@Entity('files')
export class FileRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ชื่อไฟล์ต้นฉบับ
  @Column({ name: 'original_name' })
  originalName: string;

  // ชื่อไฟล์ที่เก็บ
  @Column({ name: 'stored_name' })
  storedName: string;

  // ประเภทไฟล์
  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.OTHER,
  })
  type: FileType;

  // MIME type
  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  // ขนาดไฟล์ (bytes)
  @Column({ type: 'bigint', default: 0 })
  size: number;

  // Path หรือ URL
  @Column()
  path: string;

  // ผู้ป่วย (optional)
  @Column({ name: 'patient_id', nullable: true })
  patientId: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // Reference ID (เช่น prescription_id, invoice_id)
  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string;

  // คำอธิบาย
  @Column({ type: 'text', nullable: true })
  description: string;

  // ผู้อัพโหลด
  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
