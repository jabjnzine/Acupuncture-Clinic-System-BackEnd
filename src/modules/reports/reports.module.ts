import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Patient } from '../patients/entities/patient.entity';
import { Diagnosis } from '../diagnosis/entities/diagnosis.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Prescription } from '../herbs/entities/prescription.entity';
import { Invoice } from '../financial/entities/invoice.entity';
import { Payment } from '../financial/entities/payment.entity';
import { Expense } from '../financial/entities/expense.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Queue } from '../appointments/entities/queue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Diagnosis,
      Treatment,
      Prescription,
      Invoice,
      Payment,
      Expense,
      Appointment,
      Queue,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
