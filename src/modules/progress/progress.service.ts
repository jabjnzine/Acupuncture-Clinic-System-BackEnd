import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentProgress } from './entities/treatment-progress.entity';
import { CreateProgressDto } from './dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(TreatmentProgress)
    private readonly progressRepository: Repository<TreatmentProgress>,
  ) {}

  async create(dto: CreateProgressDto): Promise<TreatmentProgress> {
    const progress = this.progressRepository.create({
      ...dto,
      recordDate: dto.recordDate ? new Date(dto.recordDate) : new Date(),
      improvedSymptoms: dto.improvedSymptoms || [],
      remainingSymptoms: dto.remainingSymptoms || [],
      newSymptoms: dto.newSymptoms || [],
      sideEffects: dto.sideEffects || [],
    });
    return this.progressRepository.save(progress);
  }

  async findByPatient(patientId: string): Promise<TreatmentProgress[]> {
    return this.progressRepository.find({
      where: { patientId },
      order: { recordDate: 'DESC' },
      relations: ['treatment'],
    });
  }

  async findOne(id: string): Promise<TreatmentProgress> {
    const progress = await this.progressRepository.findOne({
      where: { id },
      relations: ['patient', 'treatment'],
    });
    if (!progress) {
      throw new NotFoundException(`ไม่พบบันทึกความก้าวหน้า ${id}`);
    }
    return progress;
  }

  async delete(id: string): Promise<void> {
    const result = await this.progressRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ไม่พบบันทึกความก้าวหน้า ${id}`);
    }
  }

  async getPatientTrend(patientId: string): Promise<{
    painTrend: { date: string; value: number }[];
    functionTrend: { date: string; value: number }[];
    qualityTrend: { date: string; value: number }[];
    overallImprovement: number;
    latestVsFirst: {
      painChange: number;
      functionChange: number;
      qualityChange: number;
    };
  }> {
    const records = await this.progressRepository.find({
      where: { patientId },
      order: { recordDate: 'ASC' },
    });

    if (records.length === 0) {
      return {
        painTrend: [],
        functionTrend: [],
        qualityTrend: [],
        overallImprovement: 0,
        latestVsFirst: { painChange: 0, functionChange: 0, qualityChange: 0 },
      };
    }

    const painTrend = records
      .filter((r) => r.painLevel !== null)
      .map((r) => ({
        date: r.recordDate.toISOString().split('T')[0],
        value: r.painLevel,
      }));

    const functionTrend = records
      .filter((r) => r.functionLevel !== null)
      .map((r) => ({
        date: r.recordDate.toISOString().split('T')[0],
        value: r.functionLevel,
      }));

    const qualityTrend = records
      .filter((r) => r.qualityOfLife !== null)
      .map((r) => ({
        date: r.recordDate.toISOString().split('T')[0],
        value: r.qualityOfLife,
      }));

    // Calculate changes
    const first = records[0];
    const latest = records[records.length - 1];

    const painChange = (first.painLevel ?? 0) - (latest.painLevel ?? 0);
    const functionChange = (latest.functionLevel ?? 0) - (first.functionLevel ?? 0);
    const qualityChange = (latest.qualityOfLife ?? 0) - (first.qualityOfLife ?? 0);

    // Overall improvement (weighted average of improvements)
    let improvements = 0;
    let count = 0;

    if (first.painLevel != null && latest.painLevel != null) {
      improvements += (painChange / (first.painLevel || 1)) * 100;
      count++;
    }
    if (first.functionLevel != null && latest.functionLevel != null && first.functionLevel > 0) {
      improvements += functionChange;
      count++;
    }
    if (first.qualityOfLife != null && latest.qualityOfLife != null && first.qualityOfLife > 0) {
      improvements += qualityChange;
      count++;
    }

    return {
      painTrend,
      functionTrend,
      qualityTrend,
      overallImprovement: count > 0 ? Math.round(improvements / count) : 0,
      latestVsFirst: {
        painChange,
        functionChange,
        qualityChange,
      },
    };
  }

  async getSatisfactionStats(patientId?: string): Promise<{
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const queryBuilder = this.progressRepository
      .createQueryBuilder('progress')
      .where('progress.satisfaction_rating IS NOT NULL');

    if (patientId) {
      queryBuilder.andWhere('progress.patient_id = :patientId', { patientId });
    }

    const avgResult = await queryBuilder
      .clone()
      .select('AVG(progress.satisfaction_rating)', 'avg')
      .getRawOne();

    const distribution = await queryBuilder
      .clone()
      .select('progress.satisfaction_rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .groupBy('progress.satisfaction_rating')
      .orderBy('rating', 'DESC')
      .getRawMany();

    return {
      averageRating: Math.round((avgResult?.avg || 0) * 10) / 10,
      ratingDistribution: distribution,
    };
  }
}
