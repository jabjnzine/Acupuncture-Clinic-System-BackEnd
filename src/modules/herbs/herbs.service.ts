import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThanOrEqual } from 'typeorm';
import { Herb } from './entities/herb.entity';
import { HerbalFormula } from './entities/herbal-formula.entity';
import { Prescription } from './entities/prescription.entity';
import { StockMovement, StockMovementType } from './entities/stock-movement.entity';
import {
  CreateHerbDto,
  UpdateHerbDto,
  CreatePrescriptionDto,
  CreateStockMovementDto,
  QueryHerbDto,
  QueryPrescriptionDto,
} from './dto';
import { PaginatedResponse, createPaginatedResponse } from '../../common/dto';

@Injectable()
export class HerbsService {
  constructor(
    @InjectRepository(Herb)
    private readonly herbRepository: Repository<Herb>,
    @InjectRepository(HerbalFormula)
    private readonly formulaRepository: Repository<HerbalFormula>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
  ) {}

  // ====================
  // Herb CRUD
  // ====================

  async createHerb(dto: CreateHerbDto): Promise<Herb> {
    const herb = this.herbRepository.create({
      ...dto,
      meridians: dto.meridians || [],
      indications: dto.indications || [],
      contraindications: dto.contraindications || [],
    });
    return this.herbRepository.save(herb);
  }

  async findAllHerbs(query: QueryHerbDto): Promise<PaginatedResponse<Herb>> {
    const { search, category, page = 1, limit = 10, sortBy = 'nameTh', sortOrder = 'ASC' } = query;
    
    const queryBuilder = this.herbRepository
      .createQueryBuilder('herb')
      .where('herb.is_active = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(herb.code ILIKE :search OR herb.name_th ILIKE :search OR herb.name_en ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('herb.category = :category', { category });
    }

    // Sorting
    const validSortColumns = ['nameTh', 'code', 'createdAt', 'stockQuantity'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'nameTh';
    queryBuilder.orderBy(`herb.${sortColumn}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findHerbById(id: string): Promise<Herb> {
    const herb = await this.herbRepository.findOne({
      where: { id, isActive: true },
    });
    if (!herb) {
      throw new NotFoundException(`ไม่พบสมุนไพรรหัส ${id}`);
    }
    return herb;
  }

  async updateHerb(id: string, dto: UpdateHerbDto): Promise<Herb> {
    const herb = await this.findHerbById(id);
    Object.assign(herb, dto);
    return this.herbRepository.save(herb);
  }

  async deleteHerb(id: string): Promise<void> {
    const herb = await this.findHerbById(id);
    herb.isActive = false;
    await this.herbRepository.save(herb);
  }

  async getLowStockHerbs(): Promise<Herb[]> {
    return this.herbRepository
      .createQueryBuilder('herb')
      .where('herb.is_active = :isActive', { isActive: true })
      .andWhere('herb.stock_quantity <= herb.reorder_level')
      .orderBy('herb.stock_quantity', 'ASC')
      .getMany();
  }

  async getHerbCategories(): Promise<string[]> {
    const result = await this.herbRepository
      .createQueryBuilder('herb')
      .select('DISTINCT herb.category', 'category')
      .where('herb.is_active = :isActive', { isActive: true })
      .andWhere('herb.category IS NOT NULL')
      .getRawMany();
    return result.map((r) => r.category);
  }

  // ====================
  // Prescription
  // ====================

  private async generatePrescriptionNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const prefix = `RX${year}${month}${day}`;

    const lastPrescription = await this.prescriptionRepository.findOne({
      where: { prescriptionNumber: Like(`${prefix}%`) },
      order: { prescriptionNumber: 'DESC' },
    });

    let runningNumber = 1;
    if (lastPrescription) {
      const lastNumber = parseInt(lastPrescription.prescriptionNumber.slice(-4), 10);
      runningNumber = lastNumber + 1;
    }

    return `${prefix}${runningNumber.toString().padStart(4, '0')}`;
  }

  async createPrescription(dto: CreatePrescriptionDto): Promise<Prescription> {
    const prescriptionNumber = await this.generatePrescriptionNumber();

    // Calculate total price
    const totalPrice = dto.items.reduce((sum, item) => sum + item.totalPrice, 0) * (dto.quantitySets || 1);

    const prescription = this.prescriptionRepository.create({
      ...dto,
      prescriptionNumber,
      totalPrice,
      status: 'pending',
    });

    return this.prescriptionRepository.save(prescription);
  }

  async findAllPrescriptions(query: QueryPrescriptionDto): Promise<PaginatedResponse<Prescription>> {
    const { patientId, status, page = 1, limit = 10, sortOrder = 'DESC' } = query;
    
    const queryBuilder = this.prescriptionRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.patient', 'patient')
      .leftJoinAndSelect('prescription.formula', 'formula');

    if (patientId) {
      queryBuilder.andWhere('prescription.patient_id = :patientId', { patientId });
    }

    if (status) {
      queryBuilder.andWhere('prescription.status = :status', { status });
    }

    queryBuilder.orderBy('prescription.prescriptionDate', sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findPrescriptionById(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['patient', 'formula'],
    });
    if (!prescription) {
      throw new NotFoundException(`ไม่พบใบสั่งยารหัส ${id}`);
    }
    return prescription;
  }

  async dispensePrescription(id: string): Promise<Prescription> {
    const prescription = await this.findPrescriptionById(id);

    if (prescription.status !== 'pending') {
      throw new BadRequestException('ใบสั่งยานี้ถูกจ่ายแล้วหรือยกเลิกไปแล้ว');
    }

    // Deduct stock for each item
    for (const item of prescription.items) {
      const herb = await this.findHerbById(item.herbId);
      const totalQuantity = item.quantity * prescription.quantitySets;

      if (herb.stockQuantity < totalQuantity) {
        throw new BadRequestException(`สมุนไพร ${item.herbName} มีไม่เพียงพอ (คงเหลือ ${herb.stockQuantity} ${herb.unit})`);
      }

      // Create stock movement
      await this.createStockMovement({
        herbId: item.herbId,
        type: StockMovementType.OUT,
        quantity: totalQuantity,
        reason: 'จ่ายยาตามใบสั่ง',
        referenceId: prescription.id,
        referenceType: 'prescription',
      });
    }

    prescription.status = 'dispensed';
    return this.prescriptionRepository.save(prescription);
  }

  async cancelPrescription(id: string): Promise<Prescription> {
    const prescription = await this.findPrescriptionById(id);

    if (prescription.status === 'dispensed') {
      throw new BadRequestException('ไม่สามารถยกเลิกใบสั่งยาที่จ่ายแล้ว');
    }

    prescription.status = 'cancelled';
    return this.prescriptionRepository.save(prescription);
  }

  // ====================
  // Stock Movement
  // ====================

  async createStockMovement(dto: CreateStockMovementDto): Promise<StockMovement> {
    const herb = await this.findHerbById(dto.herbId);

    const stockBefore = herb.stockQuantity;
    let stockAfter = stockBefore;

    switch (dto.type) {
      case StockMovementType.IN:
        stockAfter = stockBefore + dto.quantity;
        break;
      case StockMovementType.OUT:
        if (stockBefore < dto.quantity) {
          throw new BadRequestException(`สต๊อกไม่เพียงพอ (คงเหลือ ${stockBefore})`);
        }
        stockAfter = stockBefore - dto.quantity;
        break;
      case StockMovementType.ADJUSTMENT:
        stockAfter = dto.quantity; // Set to exact quantity
        break;
    }

    // Update herb stock
    herb.stockQuantity = stockAfter;
    await this.herbRepository.save(herb);

    // Create movement record
    const movement = this.stockMovementRepository.create({
      ...dto,
      stockBefore,
      stockAfter,
    });

    return this.stockMovementRepository.save(movement);
  }

  async getStockMovements(herbId?: string, startDate?: string, endDate?: string): Promise<StockMovement[]> {
    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.herb', 'herb')
      .orderBy('movement.created_at', 'DESC');

    if (herbId) {
      queryBuilder.andWhere('movement.herb_id = :herbId', { herbId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('movement.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder.getMany();
  }

  // ====================
  // Herbal Formulas
  // ====================

  async findAllFormulas(category?: string): Promise<HerbalFormula[]> {
    const queryBuilder = this.formulaRepository
      .createQueryBuilder('formula')
      .where('formula.is_active = :isActive', { isActive: true });

    if (category) {
      queryBuilder.andWhere('formula.category = :category', { category });
    }

    return queryBuilder.orderBy('formula.name_th', 'ASC').getMany();
  }

  async findFormulaById(id: string): Promise<HerbalFormula> {
    const formula = await this.formulaRepository.findOne({
      where: { id, isActive: true },
    });
    if (!formula) {
      throw new NotFoundException(`ไม่พบตำรับยารหัส ${id}`);
    }
    return formula;
  }

  // ====================
  // Statistics
  // ====================

  async getHerbStatistics(): Promise<{
    totalHerbs: number;
    lowStock: number;
    totalPrescriptions: number;
    pendingPrescriptions: number;
  }> {
    const totalHerbs = await this.herbRepository.count({
      where: { isActive: true },
    });

    const lowStock = await this.herbRepository
      .createQueryBuilder('herb')
      .where('herb.is_active = :isActive', { isActive: true })
      .andWhere('herb.stock_quantity <= herb.reorder_level')
      .getCount();

    const totalPrescriptions = await this.prescriptionRepository.count();

    const pendingPrescriptions = await this.prescriptionRepository.count({
      where: { status: 'pending' },
    });

    return {
      totalHerbs,
      lowStock,
      totalPrescriptions,
      pendingPrescriptions,
    };
  }
}
