import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Package } from './entities/package.entity';
import { PatientPackage, PatientPackageStatus } from './entities/patient-package.entity';
import { PackageUsage } from './entities/package-usage.entity';
import {
  CreatePackageDto,
  UpdatePackageDto,
  CreatePatientPackageDto,
  UsePackageSessionDto,
} from './dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(PatientPackage)
    private patientPackageRepository: Repository<PatientPackage>,
    @InjectRepository(PackageUsage)
    private packageUsageRepository: Repository<PackageUsage>,
  ) {}

  // ==================== Packages ====================

  async createPackage(dto: CreatePackageDto): Promise<Package> {
    const pkg = this.packageRepository.create(dto);
    return this.packageRepository.save(pkg);
  }

  async findAllPackages(
    activeOnly = false,
    page = 1,
    limit = 20,
  ): Promise<{ data: Package[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = this.packageRepository
      .createQueryBuilder('pkg')
      .leftJoinAndSelect('pkg.service', 'service');

    if (activeOnly) {
      query.where('pkg.is_active = :isActive', { isActive: true });
    }

    query.orderBy('pkg.name', 'ASC');

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  async findPackageById(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({
      where: { id },
      relations: ['service'],
    });
    if (!pkg) {
      throw new NotFoundException(`ไม่พบแพ็คเกจ ID: ${id}`);
    }
    return pkg;
  }

  async updatePackage(id: string, dto: UpdatePackageDto): Promise<Package> {
    const pkg = await this.findPackageById(id);
    Object.assign(pkg, dto);
    return this.packageRepository.save(pkg);
  }

  async removePackage(id: string): Promise<void> {
    const pkg = await this.findPackageById(id);
    await this.packageRepository.remove(pkg);
  }

  // ==================== Patient Packages ====================

  async purchasePackage(dto: CreatePatientPackageDto): Promise<PatientPackage> {
    const pkg = await this.findPackageById(dto.packageId);

    const purchaseDate = dto.purchaseDate
      ? new Date(dto.purchaseDate)
      : new Date();
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + pkg.validDays);

    const patientPackage = this.patientPackageRepository.create({
      patientId: dto.patientId,
      packageId: dto.packageId,
      purchaseDate,
      expiryDate,
      totalSessions: pkg.totalSessions,
      usedSessions: 0,
      status: PatientPackageStatus.ACTIVE,
      invoiceId: dto.invoiceId,
      notes: dto.notes,
    });

    return this.patientPackageRepository.save(patientPackage);
  }

  async findPatientPackages(patientId: string): Promise<PatientPackage[]> {
    return this.patientPackageRepository.find({
      where: { patientId },
      relations: ['package', 'package.service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActivePatientPackages(patientId: string): Promise<PatientPackage[]> {
    const now = new Date();
    return this.patientPackageRepository
      .createQueryBuilder('pp')
      .leftJoinAndSelect('pp.package', 'pkg')
      .leftJoinAndSelect('pkg.service', 'service')
      .where('pp.patient_id = :patientId', { patientId })
      .andWhere('pp.status = :status', { status: PatientPackageStatus.ACTIVE })
      .andWhere('pp.expiry_date >= :now', { now })
      .andWhere('pp.used_sessions < pp.total_sessions')
      .orderBy('pp.expiry_date', 'ASC')
      .getMany();
  }

  async findAllPatientPackages(params?: {
    page?: number;
    limit?: number;
    status?: string;
    month?: string;
  }): Promise<{ data: PatientPackage[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};
    
    if (params?.status) {
      whereConditions.status = params.status;
    }

    // Month filter (YYYY-MM format)
    if (params?.month) {
      const [year, monthNum] = params.month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0); // Last day of month
      whereConditions.purchaseDate = Between(startDate, endDate);
    }
    
    const [data, total] = await this.patientPackageRepository.findAndCount({
      where: whereConditions,
      relations: ['package', 'patient'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  async findPatientPackageById(id: string): Promise<PatientPackage> {
    const pp = await this.patientPackageRepository.findOne({
      where: { id },
      relations: ['package', 'package.service', 'patient'],
    });
    if (!pp) {
      throw new NotFoundException(`ไม่พบแพ็คเกจของผู้ป่วย ID: ${id}`);
    }
    return pp;
  }

  // ==================== Package Usage ====================

  async useSession(dto: UsePackageSessionDto): Promise<PackageUsage> {
    const patientPackage = await this.findPatientPackageById(dto.patientPackageId);

    // Check if package is still valid
    if (patientPackage.status !== PatientPackageStatus.ACTIVE) {
      throw new BadRequestException('แพ็คเกจนี้ไม่สามารถใช้งานได้');
    }

    const now = new Date();
    if (patientPackage.expiryDate < now) {
      // Update status to expired
      patientPackage.status = PatientPackageStatus.EXPIRED;
      await this.patientPackageRepository.save(patientPackage);
      throw new BadRequestException('แพ็คเกจนี้หมดอายุแล้ว');
    }

    if (patientPackage.usedSessions >= patientPackage.totalSessions) {
      throw new BadRequestException('แพ็คเกจนี้ใช้ครบจำนวนครั้งแล้ว');
    }

    try {
      // Create usage record using relation
      const usage = new PackageUsage();
      usage.patientPackage = patientPackage;
      usage.treatmentId = dto.treatmentId;
      usage.usageDate = dto.usageDate ? new Date(dto.usageDate) : new Date();
      usage.notes = dto.notes;
      
      await this.packageUsageRepository.save(usage);

      // Update used sessions
      patientPackage.usedSessions += 1;
      if (patientPackage.usedSessions >= patientPackage.totalSessions) {
        patientPackage.status = PatientPackageStatus.COMPLETED;
      }
      await this.patientPackageRepository.save(patientPackage);

      return usage;
    } catch (error) {
      console.error('Error in useSession:', error);
      throw new BadRequestException(`ไม่สามารถบันทึกการใช้คอร์สได้: ${error.message}`);
    }
  }

  async getPackageUsages(patientPackageId: string): Promise<PackageUsage[]> {
    return this.packageUsageRepository.find({
      where: { patientPackage: { id: patientPackageId } },
      order: { usageDate: 'DESC' },
    });
  }
}
