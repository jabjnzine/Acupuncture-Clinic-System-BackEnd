import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

@Entity('diagnoses')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'visit_date', type: 'date' })
  visitDate: Date;

  // อาการหลัก
  @Column({ name: 'chief_complaint', type: 'text' })
  chiefComplaint: string;

  // การตรวจชีพจร (Pulse Diagnosis)
  @Column({ name: 'pulse_left', nullable: true })
  pulseLeft: string;

  @Column({ name: 'pulse_right', nullable: true })
  pulseRight: string;

  @Column({ name: 'pulse_rate', nullable: true })
  pulseRate: number;

  @Column({ name: 'pulse_quality', nullable: true })
  pulseQuality: string;

  // การตรวจลิ้น (Tongue Diagnosis)
  @Column({ name: 'tongue_body_color', nullable: true })
  tongueBodyColor: string;

  @Column({ name: 'tongue_coating', nullable: true })
  tongueCoating: string;

  @Column({ name: 'tongue_shape', nullable: true })
  tongueShape: string;

  @Column({ name: 'tongue_moisture', nullable: true })
  tongueMoisture: string;

  // ธาตุที่เสียสมดุล
  @Column({ name: 'element_pattern', nullable: true })
  elementPattern: string;

  // Syndrome Differentiation
  @Column({ nullable: true })
  syndrome: string;

  // เส้นลมที่เกี่ยวข้อง (Meridians)
  @Column('text', { array: true, default: '{}' })
  meridians: string[];

  // อาการรอง
  @Column({ name: 'secondary_symptoms', type: 'text', nullable: true })
  secondarySymptoms: string;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  // แพทย์ผู้วินิจฉัย
  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
