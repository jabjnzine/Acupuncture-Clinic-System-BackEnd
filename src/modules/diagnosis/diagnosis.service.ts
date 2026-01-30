import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { CreateDiagnosisDto, UpdateDiagnosisDto, QueryDiagnosisDto } from './dto';
import { PaginatedResponse, createPaginatedResponse } from '../../common/dto';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepository: Repository<Diagnosis>,
  ) {}

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    const diagnosis = this.diagnosisRepository.create({
      ...createDiagnosisDto,
      meridians: createDiagnosisDto.meridians || [],
    });
    return this.diagnosisRepository.save(diagnosis);
  }

  async findAll(query: QueryDiagnosisDto): Promise<PaginatedResponse<Diagnosis>> {
    const { patientId, page = 1, limit = 10, sortOrder = 'DESC' } = query;
    
    const queryBuilder = this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.patient', 'patient');

    if (patientId) {
      queryBuilder.where('diagnosis.patient_id = :patientId', { patientId });
    }

    queryBuilder.orderBy('diagnosis.visitDate', sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findByPatient(patientId: string): Promise<Diagnosis[]> {
    return this.diagnosisRepository.find({
      where: { patientId },
      order: { visitDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!diagnosis) {
      throw new NotFoundException(`ไม่พบการวินิจฉัยรหัส ${id}`);
    }

    return diagnosis;
  }

  async update(id: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis> {
    const diagnosis = await this.findOne(id);
    Object.assign(diagnosis, updateDiagnosisDto);
    return this.diagnosisRepository.save(diagnosis);
  }

  async remove(id: string): Promise<void> {
    const result = await this.diagnosisRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ไม่พบการวินิจฉัยรหัส ${id}`);
    }
  }

  async getRecentDiagnoses(limit: number = 10): Promise<Diagnosis[]> {
    return this.diagnosisRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['patient'],
    });
  }
}
