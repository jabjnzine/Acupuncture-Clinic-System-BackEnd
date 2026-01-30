import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboard() {
    const data = await this.reportsService.getDashboardSummary();
    return { success: true, data };
  }

  @Get('patients')
  async getPatientStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.reportsService.getPatientStatistics(startDate, endDate);
    return { success: true, data };
  }

  @Get('treatments')
  async getTreatmentStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.reportsService.getTreatmentStatistics(startDate, endDate);
    return { success: true, data };
  }

  @Get('financial')
  async getFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.reportsService.getFinancialReport(startDate, endDate);
    return { success: true, data };
  }

  @Get('prescriptions')
  async getPrescriptionStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.reportsService.getPrescriptionStatistics(startDate, endDate);
    return { success: true, data };
  }

  @Get('appointments')
  async getAppointmentStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.reportsService.getAppointmentStatistics(startDate, endDate);
    return { success: true, data };
  }
}
