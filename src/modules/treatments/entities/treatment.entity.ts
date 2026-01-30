import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Diagnosis } from '../../diagnosis/entities/diagnosis.entity';

@Entity('treatments')
export class Treatment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'diagnosis_id', nullable: true })
  diagnosisId: string;

  @ManyToOne(() => Diagnosis)
  @JoinColumn({ name: 'diagnosis_id' })
  diagnosis: Diagnosis;

  @Column({ name: 'treatment_date', type: 'timestamp' })
  treatmentDate: Date;

  // จุดฝังเข็มที่เลือก (JSON array)
  @Column({ type: 'jsonb', default: '[]' })
  acupoints: AcupointSelection[];

  // เทคนิคการฝังเข็ม
  @Column({ name: 'needle_technique', nullable: true })
  needleTechnique: string;

  // ระยะเวลาฝังเข็ม (นาที)
  @Column({ name: 'retention_time', nullable: true })
  retentionTime: number;

  // Electro-acupuncture
  @Column({ name: 'electro_acupuncture', default: false })
  electroAcupuncture: boolean;

  @Column({ name: 'electro_settings', type: 'jsonb', nullable: true })
  electroSettings: ElectroSettings;

  // การรักษาเสริม
  @Column({ default: false })
  tuina: boolean;

  @Column({ default: false })
  cupping: boolean;

  @Column({ default: false })
  moxibustion: boolean;

  @Column({ name: 'gua_sha', default: false })
  guaSha: boolean;

  // อาการหลักของผู้ป่วย
  @Column({ name: 'chief_complaint', type: 'text', nullable: true })
  chiefComplaint: string;

  // บันทึกการรักษา
  @Column({ name: 'treatment_notes', type: 'text', nullable: true })
  treatmentNotes: string;

  // ผลการรักษา
  @Column({ name: 'treatment_outcome', nullable: true })
  treatmentOutcome: string;

  // ระดับความเจ็บปวดก่อน-หลัง (1-10)
  @Column({ name: 'pain_level_before', nullable: true })
  painLevelBefore: number;

  @Column({ name: 'pain_level_after', nullable: true })
  painLevelAfter: number;

  // แพทย์ผู้รักษา
  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// Types for JSON columns
export interface AcupointSelection {
  acupointId: string;
  acupointCode: string;
  acupointName: string;
  side?: 'left' | 'right' | 'bilateral' | 'center';
  depth?: number;
  notes?: string;
}

export interface ElectroSettings {
  frequency?: number;
  intensity?: number;
  duration?: number;
  waveform?: string;
}
