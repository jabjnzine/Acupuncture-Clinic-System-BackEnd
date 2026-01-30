import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create(dto);
    return this.serviceRepository.save(service);
  }

  async findAll(
    activeOnly = false,
    page = 1,
    limit = 20,
  ): Promise<{ data: Service[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = this.serviceRepository.createQueryBuilder('service');
    
    if (activeOnly) {
      query.where('service.is_active = :isActive', { isActive: true });
    }
    
    query.orderBy('service.name', 'ASC');

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`ไม่พบบริการ ID: ${id}`);
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }

  async generateCode(): Promise<string> {
    const lastService = await this.serviceRepository
      .createQueryBuilder('service')
      .orderBy('service.code', 'DESC')
      .getOne();

    if (!lastService) {
      return 'SRV001';
    }

    const lastNumber = parseInt(lastService.code.replace('SRV', ''), 10);
    const nextNumber = lastNumber + 1;
    return `SRV${nextNumber.toString().padStart(3, '0')}`;
  }
}
