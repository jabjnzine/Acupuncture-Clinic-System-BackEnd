import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Patient } from './entities/patient.entity';
import {
  CreatePatientDto,
  UpdatePatientDto,
  QueryPatientDto,
} from './dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /**
   * Generate HN Number (Hospital Number)
   * Format: HN + YYMM + running number (5 digits)
   */
  private async generateHnNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `HN${year}${month}`;

    // Find the last HN number with the same prefix
    const lastPatient = await this.patientRepository.findOne({
      where: { hnNumber: Like(`${prefix}%`) },
      order: { hnNumber: 'DESC' },
    });

    let runningNumber = 1;
    if (lastPatient) {
      const lastNumber = parseInt(lastPatient.hnNumber.slice(-5), 10);
      runningNumber = lastNumber + 1;
    }

    return `${prefix}${runningNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Create a new patient
   */
  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Use provided HN (for import) or generate new one
    let hnNumber = createPatientDto.hnNumber;
    
    if (hnNumber) {
      // Check if HN already exists
      const existing = await this.patientRepository.findOne({
        where: { hnNumber },
      });
      if (existing) {
        throw new ConflictException(`รหัส HN ${hnNumber} มีอยู่ในระบบแล้ว`);
      }
    } else {
      hnNumber = await this.generateHnNumber();
    }

    const patient = this.patientRepository.create({
      ...createPatientDto,
      hnNumber,
      allergies: createPatientDto.allergies || [],
      chronicDiseases: createPatientDto.chronicDiseases || [],
      currentMedications: createPatientDto.currentMedications || [],
    });

    return this.patientRepository.save(patient);
  }

  /**
   * Bulk import patients
   */
  async bulkImport(
    patients: CreatePatientDto[],
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const patientData of patients) {
      try {
        await this.create(patientData);
        success++;
      } catch (error) {
        failed++;
        errors.push(
          `${patientData.firstName} ${patientData.lastName}: ${error.message}`,
        );
      }
    }

    return { success, failed, errors };
  }

  /**
   * Find all patients with search and pagination
   */
  async findAll(query: QueryPatientDto): Promise<{
    data: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, gender, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const queryBuilder = this.patientRepository.createQueryBuilder('patient');

    // Search by name, HN number, phone, or email
    if (search) {
      queryBuilder.andWhere(
        '(patient.hn_number ILIKE :search OR patient.first_name ILIKE :search OR patient.last_name ILIKE :search OR patient.phone ILIKE :search OR patient.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by gender
    if (gender) {
      queryBuilder.andWhere('patient.gender = :gender', { gender });
    }

    // Only active patients
    queryBuilder.andWhere('patient.is_active = :isActive', { isActive: true });

    // Sorting
    const validSortColumns = ['createdAt', 'hnNumber', 'firstName', 'lastName'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`patient.${sortColumn}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all patients for dropdown (no pagination, minimal fields)
   */
  async findAllForDropdown(search?: string): Promise<
    { id: string; firstName: string; lastName: string; hnNumber: string; nickname?: string }[]
  > {
    const queryBuilder = this.patientRepository.createQueryBuilder('patient');

    // Select only minimal fields
    queryBuilder.select([
      'patient.id',
      'patient.firstName',
      'patient.lastName',
      'patient.hnNumber',
      'patient.nickname',
    ]);

    // Optional search
    if (search) {
      queryBuilder.andWhere(
        '(patient.hn_number ILIKE :search OR patient.first_name ILIKE :search OR patient.last_name ILIKE :search OR patient.nickname ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Only active patients
    queryBuilder.andWhere('patient.is_active = :isActive', { isActive: true });

    // Order by name
    queryBuilder.orderBy('patient.first_name', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Find one patient by ID
   */
  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id, isActive: true },
    });

    if (!patient) {
      throw new NotFoundException(`ไม่พบผู้ป่วยรหัส ${id}`);
    }

    return patient;
  }

  /**
   * Find one patient by HN Number
   */
  async findByHnNumber(hnNumber: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { hnNumber, isActive: true },
    });

    if (!patient) {
      throw new NotFoundException(`ไม่พบผู้ป่วย HN: ${hnNumber}`);
    }

    return patient;
  }

  /**
   * Update patient
   */
  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    Object.assign(patient, updatePatientDto);

    return this.patientRepository.save(patient);
  }

  /**
   * Soft delete patient (set isActive to false)
   */
  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    patient.isActive = false;
    await this.patientRepository.save(patient);
  }

  /**
   * Hard delete patient (for admin use)
   */
  async hardDelete(id: string): Promise<void> {
    const result = await this.patientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ไม่พบผู้ป่วยรหัส ${id}`);
    }
  }

  /**
   * Get patient statistics
   */
  async getStatistics(): Promise<{
    total: number;
    thisMonth: number;
    thisWeek: number;
    byGender: { gender: string; count: number }[];
  }> {
    const total = await this.patientRepository.count({
      where: { isActive: true },
    });

    // This month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.created_at >= :startOfMonth', { startOfMonth })
      .andWhere('patient.is_active = :isActive', { isActive: true })
      .getCount();

    // This week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeek = await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.created_at >= :startOfWeek', { startOfWeek })
      .andWhere('patient.is_active = :isActive', { isActive: true })
      .getCount();

    // By gender
    const byGender = await this.patientRepository
      .createQueryBuilder('patient')
      .select('patient.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('patient.is_active = :isActive', { isActive: true })
      .groupBy('patient.gender')
      .getRawMany();

    return {
      total,
      thisMonth,
      thisWeek,
      byGender,
    };
  }
}
