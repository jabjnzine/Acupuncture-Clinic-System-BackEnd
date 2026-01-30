import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';

@Entity('treatment_progress')
export class TreatmentProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'treatment_id', nullable: true })
  treatmentId: string;

  @ManyToOne(() => Treatment, { nullable: true })
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  // วันที่บันทึก
  @Column({ name: 'record_date', type: 'date' })
  recordDate: Date;

  // ระดับความเจ็บปวด (0-10)
  @Column({ name: 'pain_level', type: 'int', nullable: true })
  painLevel: number;

  // ระดับการทำงาน (0-100%)
  @Column({ name: 'function_level', type: 'int', nullable: true })
  functionLevel: number;

  // คุณภาพชีวิต (0-100%)
  @Column({ name: 'quality_of_life', type: 'int', nullable: true })
  qualityOfLife: number;

  // คุณภาพการนอน (0-10)
  @Column({ name: 'sleep_quality', type: 'int', nullable: true })
  sleepQuality: number;

  // ระดับพลังงาน (0-10)
  @Column({ name: 'energy_level', type: 'int', nullable: true })
  energyLevel: number;

  // อาการที่ดีขึ้น
  @Column('text', { array: true, default: '{}', name: 'improved_symptoms' })
  improvedSymptoms: string[];

  // อาการที่ยังมี
  @Column('text', { array: true, default: '{}', name: 'remaining_symptoms' })
  remainingSymptoms: string[];

  // อาการใหม่
  @Column('text', { array: true, default: '{}', name: 'new_symptoms' })
  newSymptoms: string[];

  // ผลข้างเคียง
  @Column('text', { array: true, default: '{}', name: 'side_effects' })
  sideEffects: string[];

  // ความพอใจ (1-5)
  @Column({ name: 'satisfaction_rating', type: 'int', nullable: true })
  satisfactionRating: number;

  // หมายเหตุจากผู้ป่วย
  @Column({ name: 'patient_notes', type: 'text', nullable: true })
  patientNotes: string;

  // หมายเหตุจากแพทย์
  @Column({ name: 'practitioner_notes', type: 'text', nullable: true })
  practitionerNotes: string;

  // แนะนำการรักษาต่อ
  @Column({ name: 'treatment_recommendation', type: 'text', nullable: true })
  treatmentRecommendation: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
