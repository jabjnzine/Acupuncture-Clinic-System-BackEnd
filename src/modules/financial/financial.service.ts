import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Invoice, PaymentStatus } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { Expense, ExpenseCategory } from './entities/expense.entity';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  CreateExpenseDto,
} from './dto';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  // ====================
  // Invoice
  // ====================

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `INV${year}${month}`;

    const lastInvoice = await this.invoiceRepository.findOne({
      where: { invoiceNumber: Like(`${prefix}%`) },
      order: { invoiceNumber: 'DESC' },
    });

    let runningNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4), 10);
      runningNumber = lastNumber + 1;
    }

    return `${prefix}${runningNumber.toString().padStart(4, '0')}`;
  }

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const subtotal = dto.items.reduce((sum, item) => sum + item.total, 0);
    let discount = dto.discount || 0;
    
    if (dto.discountType === 'percentage') {
      discount = subtotal * (discount / 100);
    }

    const total = subtotal - discount;

    const invoice = this.invoiceRepository.create({
      ...dto,
      invoiceNumber,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
      subtotal,
      discount,
      total,
    });

    return this.invoiceRepository.save(invoice);
  }

  async findAllInvoices(
    patientId?: string,
    status?: PaymentStatus,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Invoice[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .orderBy('invoice.invoiceDate', 'DESC');

    if (patientId) {
      queryBuilder.andWhere('invoice.patient_id = :patientId', { patientId });
    }

    if (status) {
      queryBuilder.andWhere('invoice.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('invoice.invoice_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  async findInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!invoice) {
      throw new NotFoundException(`ไม่พบใบแจ้งหนี้รหัส ${id}`);
    }
    return invoice;
  }

  // ====================
  // Payment
  // ====================

  private async generateReceiptNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `RCP${year}${month}`;

    const lastPayment = await this.paymentRepository.findOne({
      where: { receiptNumber: Like(`${prefix}%`) },
      order: { receiptNumber: 'DESC' },
    });

    let runningNumber = 1;
    if (lastPayment) {
      const lastNumber = parseInt(lastPayment.receiptNumber.slice(-4), 10);
      runningNumber = lastNumber + 1;
    }

    return `${prefix}${runningNumber.toString().padStart(4, '0')}`;
  }

  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    const invoice = await this.findInvoiceById(dto.invoiceId);
    const balance = Number(invoice.total) - Number(invoice.paidAmount);

    if (dto.amount > balance) {
      throw new BadRequestException(`ยอดชำระเกินยอดค้าง (ค้าง ${balance} บาท)`);
    }

    const receiptNumber = await this.generateReceiptNumber();

    const payment = this.paymentRepository.create({
      ...dto,
      receiptNumber,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
    });

    await this.paymentRepository.save(payment);

    // Update invoice
    invoice.paidAmount = Number(invoice.paidAmount) + dto.amount;
    
    if (invoice.paidAmount >= Number(invoice.total)) {
      invoice.status = PaymentStatus.PAID;
    } else {
      invoice.status = PaymentStatus.PARTIAL;
    }

    await this.invoiceRepository.save(invoice);

    return payment;
  }

  async findPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { invoiceId },
      order: { paymentDate: 'DESC' },
    });
  }

  // ====================
  // Expense
  // ====================

  async createExpense(dto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create(dto);
    return this.expenseRepository.save(expense);
  }

  async findAllExpenses(
    category?: ExpenseCategory,
    startDate?: string,
    endDate?: string,
  ): Promise<Expense[]> {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expense')
      .orderBy('expense.expenseDate', 'DESC');

    if (category) {
      queryBuilder.andWhere('expense.category = :category', { category });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('expense.expense_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder.getMany();
  }

  async findExpenseById(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`ไม่พบรายจ่ายรหัส ${id}`);
    }
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    const result = await this.expenseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ไม่พบรายจ่ายรหัส ${id}`);
    }
  }

  // ====================
  // Reports
  // ====================

  async getDailyReport(date: string): Promise<{
    income: number;
    expenses: number;
    netProfit: number;
    invoiceCount: number;
    paymentCount: number;
  }> {
    // Income from payments
    const paymentsResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('DATE(payment.payment_date) = :date', { date })
      .getRawOne();

    // Expenses
    const expensesResult = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.expense_date = :date', { date })
      .getRawOne();

    // Invoice count
    const invoiceCount = await this.invoiceRepository.count({
      where: { invoiceDate: new Date(date) },
    });

    const income = parseFloat(paymentsResult?.total) || 0;
    const expenses = parseFloat(expensesResult?.total) || 0;

    return {
      income,
      expenses,
      netProfit: income - expenses,
      invoiceCount,
      paymentCount: parseInt(paymentsResult?.count) || 0,
    };
  }

  async getMonthlyReport(year: number, month: number): Promise<{
    income: number;
    expenses: number;
    netProfit: number;
    invoiceCount: number;
    byCategory: { category: string; total: number }[];
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Income
    const incomeResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.payment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    // Expenses by category
    const expensesByCategory = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.expense_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('expense.category')
      .getRawMany();

    const totalExpenses = expensesByCategory.reduce(
      (sum, cat) => sum + parseFloat(cat.total),
      0,
    );

    // Invoice count
    const invoiceCount = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.invoice_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getCount();

    const income = parseFloat(incomeResult?.total) || 0;

    return {
      income,
      expenses: totalExpenses,
      netProfit: income - totalExpenses,
      invoiceCount,
      byCategory: expensesByCategory,
    };
  }

  async getFinancialSummary(): Promise<{
    todayIncome: number;
    thisMonthIncome: number;
    pendingPayments: number;
    thisMonthExpenses: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's income
    const todayResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('DATE(payment.payment_date) = :today', { today })
      .getRawOne();

    // This month income
    const monthResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.payment_date >= :startOfMonth', { startOfMonth })
      .getRawOne();

    // Pending payments
    const pendingResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total - invoice.paid_amount)', 'total')
      .where('invoice.status IN (:...statuses)', {
        statuses: [PaymentStatus.PENDING, PaymentStatus.PARTIAL],
      })
      .getRawOne();

    // This month expenses
    const expensesResult = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.expense_date >= :startOfMonth', { startOfMonth })
      .getRawOne();

    return {
      todayIncome: parseFloat(todayResult?.total) || 0,
      thisMonthIncome: parseFloat(monthResult?.total) || 0,
      pendingPayments: parseFloat(pendingResult?.total) || 0,
      thisMonthExpenses: parseFloat(expensesResult?.total) || 0,
    };
  }
}
