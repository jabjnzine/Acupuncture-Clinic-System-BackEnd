import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Treatment } from './entities/treatment.entity';
import { Acupoint } from './entities/acupoint.entity';
import { CreateTreatmentDto, UpdateTreatmentDto, QueryTreatmentDto } from './dto';
import { PaginatedResponse, createPaginatedResponse } from '../../common/dto';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
    @InjectRepository(Acupoint)
    private readonly acupointRepository: Repository<Acupoint>,
  ) {}

  // ====================
  // Treatment CRUD
  // ====================

  async create(createTreatmentDto: CreateTreatmentDto): Promise<Treatment> {
    const treatment = this.treatmentRepository.create({
      ...createTreatmentDto,
      acupoints: createTreatmentDto.acupoints || [],
    });
    return this.treatmentRepository.save(treatment);
  }

  async findAll(query: QueryTreatmentDto): Promise<PaginatedResponse<Treatment>> {
    const { patientId, startDate, endDate, page = 1, limit = 10, sortBy = 'treatmentDate', sortOrder = 'DESC' } = query;
    
    const queryBuilder = this.treatmentRepository
      .createQueryBuilder('treatment')
      .leftJoinAndSelect('treatment.patient', 'patient')
      .leftJoinAndSelect('treatment.diagnosis', 'diagnosis');

    if (patientId) {
      queryBuilder.andWhere('treatment.patient_id = :patientId', { patientId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('treatment.treatment_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Sorting
    const validSortColumns = ['treatmentDate', 'createdAt'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'treatmentDate';
    queryBuilder.orderBy(`treatment.${sortColumn}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findByPatient(patientId: string): Promise<Treatment[]> {
    return this.treatmentRepository.find({
      where: { patientId },
      order: { treatmentDate: 'DESC' },
      relations: ['diagnosis'],
    });
  }

  async findOne(id: string): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({
      where: { id },
      relations: ['patient', 'diagnosis'],
    });

    if (!treatment) {
      throw new NotFoundException(`ไม่พบการรักษารหัส ${id}`);
    }

    return treatment;
  }

  async update(id: string, updateTreatmentDto: UpdateTreatmentDto): Promise<Treatment> {
    const treatment = await this.findOne(id);
    Object.assign(treatment, updateTreatmentDto);
    return this.treatmentRepository.save(treatment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.treatmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ไม่พบการรักษารหัส ${id}`);
    }
  }

  async getPatientTreatmentHistory(patientId: string): Promise<Treatment[]> {
    return this.treatmentRepository.find({
      where: { patientId },
      order: { treatmentDate: 'DESC' },
      relations: ['diagnosis'],
    });
  }

  // ====================
  // Acupoint CRUD
  // ====================

  async findAllAcupoints(meridian?: string, bodyRegion?: string): Promise<Acupoint[]> {
    const queryBuilder = this.acupointRepository
      .createQueryBuilder('acupoint')
      .where('acupoint.is_active = :isActive', { isActive: true })
      .orderBy('acupoint.code', 'ASC');

    if (meridian) {
      queryBuilder.andWhere('acupoint.meridian = :meridian', { meridian });
    }

    if (bodyRegion) {
      queryBuilder.andWhere('acupoint.body_region = :bodyRegion', { bodyRegion });
    }

    return queryBuilder.getMany();
  }

  async findAcupointByCode(code: string): Promise<Acupoint> {
    const acupoint = await this.acupointRepository.findOne({
      where: { code, isActive: true },
    });

    if (!acupoint) {
      throw new NotFoundException(`ไม่พบจุดฝังเข็ม ${code}`);
    }

    return acupoint;
  }

  async findAcupointsByMeridian(meridian: string): Promise<Acupoint[]> {
    return this.acupointRepository.find({
      where: { meridian, isActive: true },
      order: { code: 'ASC' },
    });
  }

  async getAcupointMeridians(): Promise<string[]> {
    const result = await this.acupointRepository
      .createQueryBuilder('acupoint')
      .select('DISTINCT acupoint.meridian', 'meridian')
      .where('acupoint.is_active = :isActive', { isActive: true })
      .getRawMany();

    return result.map((r) => r.meridian);
  }

  async getAcupointBodyRegions(): Promise<string[]> {
    const result = await this.acupointRepository
      .createQueryBuilder('acupoint')
      .select('DISTINCT acupoint.body_region', 'bodyRegion')
      .where('acupoint.is_active = :isActive', { isActive: true })
      .getRawMany();

    return result.map((r) => r.bodyRegion);
  }

  // ====================
  // Statistics
  // ====================

  async getTreatmentStatistics(patientId?: string): Promise<{
    total: number;
    thisMonth: number;
    avgPainReduction: number;
    mostUsedAcupoints: { code: string; count: number }[];
  }> {
    const queryBuilder = this.treatmentRepository.createQueryBuilder('treatment');

    if (patientId) {
      queryBuilder.where('treatment.patient_id = :patientId', { patientId });
    }

    const total = await queryBuilder.getCount();

    // This month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthQuery = this.treatmentRepository.createQueryBuilder('treatment')
      .where('treatment.treatment_date >= :startOfMonth', { startOfMonth });
    
    if (patientId) {
      thisMonthQuery.andWhere('treatment.patient_id = :patientId', { patientId });
    }

    const thisMonth = await thisMonthQuery.getCount();

    // Average pain reduction
    const painQuery = await this.treatmentRepository
      .createQueryBuilder('treatment')
      .select('AVG(treatment.pain_level_before - treatment.pain_level_after)', 'avgReduction')
      .where('treatment.pain_level_before IS NOT NULL')
      .andWhere('treatment.pain_level_after IS NOT NULL');

    if (patientId) {
      painQuery.andWhere('treatment.patient_id = :patientId', { patientId });
    }

    const painResult = await painQuery.getRawOne();
    const avgPainReduction = parseFloat(painResult?.avgReduction) || 0;

    return {
      total,
      thisMonth,
      avgPainReduction: Math.round(avgPainReduction * 10) / 10,
      mostUsedAcupoints: [], // Would need JSON aggregation for this
    };
  }
}
