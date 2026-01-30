import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('clinic_settings')
export class ClinicSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clinic_name', default: 'คลินิกแพทย์แผนจีน' })
  clinicName: string;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'tax_id', nullable: true })
  taxId: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  // Notification settings
  @Column({ name: 'notify_appointment', default: true })
  notifyAppointment: boolean;

  @Column({ name: 'notify_low_stock', default: true })
  notifyLowStock: boolean;

  @Column({ name: 'notify_pending_payment', default: false })
  notifyPendingPayment: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
