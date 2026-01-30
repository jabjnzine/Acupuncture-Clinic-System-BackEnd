import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  CreateExpenseDto,
} from './dto';
import { PaymentStatus } from './entities/invoice.entity';
import { ExpenseCategory } from './entities/expense.entity';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // ====================
  // Invoices
  // ====================

  @Post('invoices')
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    const invoice = await this.financialService.createInvoice(dto);
    return {
      success: true,
      message: `สร้างใบแจ้งหนี้ ${invoice.invoiceNumber} สำเร็จ`,
      data: invoice,
    };
  }

  @Get('invoices')
  async findAllInvoices(
    @Query('patientId') patientId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const result = await this.financialService.findAllInvoices(
      patientId,
      status,
      startDate,
      endDate,
      pageNum,
      limitNum,
    );
    return { success: true, ...result };
  }

  @Get('invoices/:id')
  async findInvoice(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.financialService.findInvoiceById(id);
    return { success: true, data };
  }

  @Get('invoices/:id/payments')
  async findInvoicePayments(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.financialService.findPaymentsByInvoice(id);
    return { success: true, data };
  }

  // ====================
  // Payments
  // ====================

  @Post('payments')
  async createPayment(@Body() dto: CreatePaymentDto) {
    const payment = await this.financialService.createPayment(dto);
    return {
      success: true,
      message: `รับชำระเงินสำเร็จ (${payment.receiptNumber})`,
      data: payment,
    };
  }

  // ====================
  // Expenses
  // ====================

  @Post('expenses')
  async createExpense(@Body() dto: CreateExpenseDto) {
    const expense = await this.financialService.createExpense(dto);
    return {
      success: true,
      message: 'บันทึกรายจ่ายสำเร็จ',
      data: expense,
    };
  }

  @Get('expenses')
  async findAllExpenses(
    @Query('category') category?: ExpenseCategory,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.financialService.findAllExpenses(category, startDate, endDate);
    return { success: true, data };
  }

  @Get('expenses/:id')
  async findExpense(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.financialService.findExpenseById(id);
    return { success: true, data };
  }

  @Delete('expenses/:id')
  async deleteExpense(@Param('id', ParseUUIDPipe) id: string) {
    await this.financialService.deleteExpense(id);
    return {
      success: true,
      message: 'ลบรายจ่ายสำเร็จ',
    };
  }

  // ====================
  // Reports
  // ====================

  @Get('summary')
  async getSummary() {
    const data = await this.financialService.getFinancialSummary();
    return { success: true, data };
  }

  @Get('reports/daily')
  async getDailyReport(@Query('date') date: string) {
    const reportDate = date || new Date().toISOString().split('T')[0];
    const data = await this.financialService.getDailyReport(reportDate);
    return { success: true, data };
  }

  @Get('reports/monthly')
  async getMonthlyReport(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    const data = await this.financialService.getMonthlyReport(year, month);
    return { success: true, data };
  }
}
