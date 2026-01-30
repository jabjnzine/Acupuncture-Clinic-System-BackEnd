import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Diagnosis } from '../diagnosis/entities/diagnosis.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Prescription } from '../herbs/entities/prescription.entity';
import { Invoice, PaymentStatus } from '../financial/entities/invoice.entity';
import { Payment } from '../financial/entities/payment.entity';
import { Expense } from '../financial/entities/expense.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Queue, QueueStatus } from '../appointments/entities/queue.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepository: Repository<Diagnosis>,
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Queue)
    private readonly queueRepository: Repository<Queue>,
  ) {}

  // ====================
  // Dashboard Summary
  // ====================

  async getDashboardSummary(): Promise<{
    patients: { total: number; newThisMonth: number };
    appointments: { today: number; upcoming: number };
    queue: { waiting: number; avgWaitTime: number };
    financial: { todayIncome: number; monthIncome: number; pendingPayments: number };
  }> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Patients
    const totalPatients = await this.patientRepository.count({ where: { isActive: true } });
    const newThisMonth = await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.created_at >= :startOfMonth', { startOfMonth })
      .getCount();

    // Appointments
    const todayAppointments = await this.appointmentRepository.count({
      where: { appointmentDate: new Date(today), status: AppointmentStatus.SCHEDULED },
    });

    const upcomingAppointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.appointment_date > :today', { today })
      .andWhere('appointment.status = :status', { status: AppointmentStatus.SCHEDULED })
      .getCount();

    // Queue
    const waitingQueue = await this.queueRepository.count({
      where: { queueDate: new Date(today), status: QueueStatus.WAITING },
    });

    const avgWaitResult = await this.queueRepository
      .createQueryBuilder('queue')
      .select('AVG(EXTRACT(EPOCH FROM (queue.called_at - queue.registered_at)))', 'avgWait')
      .where('queue.queue_date = :today', { today })
      .andWhere('queue.called_at IS NOT NULL')
      .getRawOne();

    // Financial
    const todayIncomeResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('DATE(payment.payment_date) = :today', { today })
      .getRawOne();

    const monthIncomeResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.payment_date >= :startOfMonth', { startOfMonth })
      .getRawOne();

    const pendingResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total - invoice.paid_amount)', 'total')
      .where('invoice.status IN (:...statuses)', {
        statuses: [PaymentStatus.PENDING, PaymentStatus.PARTIAL],
      })
      .getRawOne();

    return {
      patients: {
        total: totalPatients,
        newThisMonth,
      },
      appointments: {
        today: todayAppointments,
        upcoming: upcomingAppointments,
      },
      queue: {
        waiting: waitingQueue,
        avgWaitTime: Math.round((avgWaitResult?.avgWait || 0) / 60),
      },
      financial: {
        todayIncome: parseFloat(todayIncomeResult?.total) || 0,
        monthIncome: parseFloat(monthIncomeResult?.total) || 0,
        pendingPayments: parseFloat(pendingResult?.total) || 0,
      },
    };
  }

  // ====================
  // Patient Reports
  // ====================

  async getPatientStatistics(startDate: string, endDate: string): Promise<{
    total: number;
    newPatients: number;
    byGender: { gender: string; count: number }[];
    byAge: { range: string; count: number }[];
    topDiagnoses: { diagnosis: string; count: number }[];
  }> {
    const total = await this.patientRepository.count({ where: { isActive: true } });

    const newPatients = await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getCount();

    const byGender = await this.patientRepository
      .createQueryBuilder('patient')
      .select('patient.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('patient.is_active = :isActive', { isActive: true })
      .groupBy('patient.gender')
      .getRawMany();

    // Age distribution
    const ageRanges = await this.patientRepository
      .createQueryBuilder('patient')
      .select(`
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(patient.date_of_birth)) < 18 THEN '0-17'
          WHEN EXTRACT(YEAR FROM AGE(patient.date_of_birth)) < 30 THEN '18-29'
          WHEN EXTRACT(YEAR FROM AGE(patient.date_of_birth)) < 45 THEN '30-44'
          WHEN EXTRACT(YEAR FROM AGE(patient.date_of_birth)) < 60 THEN '45-59'
          ELSE '60+'
        END
      `, 'range')
      .addSelect('COUNT(*)', 'count')
      .where('patient.is_active = :isActive', { isActive: true })
      .andWhere('patient.date_of_birth IS NOT NULL')
      .groupBy('range')
      .orderBy('range', 'ASC')
      .getRawMany();

    // Top diagnoses
    const topDiagnoses = await this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .select('diagnosis.syndrome', 'diagnosis')
      .addSelect('COUNT(*)', 'count')
      .where('diagnosis.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('diagnosis.syndrome IS NOT NULL')
      .groupBy('diagnosis.syndrome')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      newPatients,
      byGender,
      byAge: ageRanges,
      topDiagnoses,
    };
  }

  // ====================
  // Treatment Reports
  // ====================

  async getTreatmentStatistics(startDate: string, endDate: string): Promise<{
    totalTreatments: number;
    byType: { type: string; count: number }[];
    topAcupoints: { acupoint: string; count: number }[];
    avgPainReduction: number;
    successRate: number;
  }> {
    const totalTreatments = await this.treatmentRepository
      .createQueryBuilder('treatment')
      .where('treatment.treatment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getCount();

    // By supplementary treatment type
    const tuinaCount = await this.treatmentRepository.count({
      where: { tuina: true },
    });
    const cuppingCount = await this.treatmentRepository.count({
      where: { cupping: true },
    });
    const moxibustionCount = await this.treatmentRepository.count({
      where: { moxibustion: true },
    });
    const guaShaCount = await this.treatmentRepository.count({
      where: { guaSha: true },
    });

    const byType = [
      { type: 'Tuina', count: tuinaCount },
      { type: 'Cupping', count: cuppingCount },
      { type: 'Moxibustion', count: moxibustionCount },
      { type: 'Gua Sha', count: guaShaCount },
    ];

    // Average pain reduction
    const painResult = await this.treatmentRepository
      .createQueryBuilder('treatment')
      .select('AVG(treatment.pain_level_before - treatment.pain_level_after)', 'avgReduction')
      .where('treatment.treatment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('treatment.pain_level_before IS NOT NULL')
      .andWhere('treatment.pain_level_after IS NOT NULL')
      .getRawOne();

    // Success rate (pain reduced by > 50%)
    const successfulTreatments = await this.treatmentRepository
      .createQueryBuilder('treatment')
      .where('treatment.treatment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('treatment.pain_level_before IS NOT NULL')
      .andWhere('treatment.pain_level_after IS NOT NULL')
      .andWhere('(treatment.pain_level_before - treatment.pain_level_after) >= (treatment.pain_level_before * 0.5)')
      .getCount();

    const treatmentsWithPain = await this.treatmentRepository
      .createQueryBuilder('treatment')
      .where('treatment.treatment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('treatment.pain_level_before IS NOT NULL')
      .andWhere('treatment.pain_level_after IS NOT NULL')
      .getCount();

    return {
      totalTreatments,
      byType,
      topAcupoints: [], // Would need JSON aggregation
      avgPainReduction: Math.round((painResult?.avgReduction || 0) * 10) / 10,
      successRate: treatmentsWithPain > 0 ? Math.round((successfulTreatments / treatmentsWithPain) * 100) : 0,
    };
  }

  // ====================
  // Financial Reports
  // ====================

  async getFinancialReport(startDate: string, endDate: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    incomeByCategory: { category: string; total: number }[];
    expensesByCategory: { category: string; total: number }[];
    dailyIncome: { date: string; amount: number }[];
  }> {
    // Total income
    const incomeResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.payment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    // Total expenses
    const expenseResult = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.expense_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    // Expenses by category
    const expensesByCategory = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.expense_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('expense.category')
      .getRawMany();

    // Daily income
    const dailyIncome = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('DATE(payment.payment_date)', 'date')
      .addSelect('SUM(payment.amount)', 'amount')
      .where('payment.payment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(payment.payment_date)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const totalIncome = parseFloat(incomeResult?.total) || 0;
    const totalExpenses = parseFloat(expenseResult?.total) || 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      incomeByCategory: [], // Would need invoice item categorization
      expensesByCategory,
      dailyIncome,
    };
  }

  // ====================
  // Prescription Reports
  // ====================

  async getPrescriptionStatistics(startDate: string, endDate: string): Promise<{
    totalPrescriptions: number;
    totalRevenue: number;
    byStatus: { status: string; count: number }[];
    topHerbs: { herb: string; quantity: number }[];
  }> {
    const totalPrescriptions = await this.prescriptionRepository
      .createQueryBuilder('prescription')
      .where('prescription.prescription_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getCount();

    const revenueResult = await this.prescriptionRepository
      .createQueryBuilder('prescription')
      .select('SUM(prescription.total_price)', 'total')
      .where('prescription.prescription_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('prescription.status = :status', { status: 'dispensed' })
      .getRawOne();

    const byStatus = await this.prescriptionRepository
      .createQueryBuilder('prescription')
      .select('prescription.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('prescription.prescription_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('prescription.status')
      .getRawMany();

    return {
      totalPrescriptions,
      totalRevenue: parseFloat(revenueResult?.total) || 0,
      byStatus,
      topHerbs: [], // Would need JSON aggregation from prescription items
    };
  }

  // ====================
  // Appointment Reports
  // ====================

  async getAppointmentStatistics(startDate: string, endDate: string): Promise<{
    totalAppointments: number;
    completedRate: number;
    noShowRate: number;
    byType: { type: string; count: number }[];
    byDayOfWeek: { day: string; count: number }[];
  }> {
    const total = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.appointment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getCount();

    const completed = await this.appointmentRepository.count({
      where: { status: AppointmentStatus.COMPLETED },
    });

    const noShow = await this.appointmentRepository.count({
      where: { status: AppointmentStatus.NO_SHOW },
    });

    const byType = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('appointment.appointment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('appointment.type')
      .getRawMany();

    const byDayOfWeek = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('TO_CHAR(appointment.appointment_date, \'Day\')', 'day')
      .addSelect('COUNT(*)', 'count')
      .where('appointment.appointment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('day')
      .getRawMany();

    return {
      totalAppointments: total,
      completedRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0,
      byType,
      byDayOfWeek,
    };
  }
}
