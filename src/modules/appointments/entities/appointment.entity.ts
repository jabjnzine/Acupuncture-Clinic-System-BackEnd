import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentType {
  NEW_VISIT = 'new_visit',
  FOLLOW_UP = 'follow_up',
  ACUPUNCTURE = 'acupuncture',
  HERBAL_CONSULTATION = 'herbal_consultation',
  TUINA = 'tuina',
  GENERAL = 'general',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // วันนัด
  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: Date;

  // เวลานัด
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  // เวลาสิ้นสุด
  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string;

  // ประเภทการนัดหมาย
  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.GENERAL,
  })
  type: AppointmentType;

  // สถานะ
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  // เหตุผลนัดหมาย
  @Column({ nullable: true })
  reason: string;

  // แพทย์ที่นัดหมาย
  @Column({ name: 'practitioner_id', nullable: true })
  practitionerId: string;

  // เวลา check-in จริง
  @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt: Date;

  // เวลาเริ่มรักษาจริง
  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  // เวลาเสร็จสิ้น
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  // เตือนล่วงหน้า (นาที)
  @Column({ name: 'reminder_sent', default: false })
  reminderSent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
