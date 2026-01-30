import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Appointment } from './appointment.entity';

export enum QueueStatus {
  WAITING = 'waiting',
  CALLED = 'called',
  IN_SERVICE = 'in_service',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled',
}

@Entity('queues')
export class Queue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // เลขคิว
  @Column({ name: 'queue_number' })
  queueNumber: number;

  // Prefix คิว (เช่น A, B, C สำหรับแยกประเภท)
  @Column({ name: 'queue_prefix', default: 'A' })
  queuePrefix: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  // วันที่คิว
  @Column({ name: 'queue_date', type: 'date' })
  queueDate: Date;

  // สถานะ
  @Column({
    type: 'enum',
    enum: QueueStatus,
    default: QueueStatus.WAITING,
  })
  status: QueueStatus;

  // ประเภทบริการ
  @Column({ name: 'service_type', nullable: true })
  serviceType: string;

  // ลำดับความสำคัญ (1 = สูงสุด)
  @Column({ default: 5 })
  priority: number;

  // เวลาลงทะเบียนคิว
  @Column({ name: 'registered_at', type: 'timestamp' })
  registeredAt: Date;

  // เวลาเรียกคิว
  @Column({ name: 'called_at', type: 'timestamp', nullable: true })
  calledAt: Date;

  // เวลาเริ่มให้บริการ
  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  // เวลาเสร็จสิ้น
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  // ห้องตรวจ/จุดบริการ
  @Column({ name: 'service_point', nullable: true })
  servicePoint: string;

  // หมายเหตุ
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Computed field: เลขคิวรวม prefix
  get fullQueueNumber(): string {
    return `${this.queuePrefix}${this.queueNumber.toString().padStart(3, '0')}`;
  }
}
