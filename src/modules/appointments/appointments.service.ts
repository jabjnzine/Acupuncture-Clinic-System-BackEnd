import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Queue, QueueStatus } from './entities/queue.entity';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CreateQueueDto,
  QueryAppointmentDto,
} from './dto';
import { PaginatedResponse, createPaginatedResponse } from '../../common/dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Queue)
    private readonly queueRepository: Repository<Queue>,
  ) {}

  // ====================
  // Appointments
  // ====================

  async createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
    // Check for conflict
    const existing = await this.appointmentRepository.findOne({
      where: {
        appointmentDate: new Date(dto.appointmentDate),
        startTime: dto.startTime,
        practitionerId: dto.practitionerId,
        status: AppointmentStatus.SCHEDULED,
      },
    });

    if (existing) {
      throw new BadRequestException('ช่วงเวลานี้มีนัดหมายแล้ว');
    }

    const appointment = this.appointmentRepository.create(dto);
    return this.appointmentRepository.save(appointment);
  }

  async findAllAppointments(query: QueryAppointmentDto): Promise<PaginatedResponse<Appointment>> {
    const { date, patientId, status, page = 1, limit = 10, sortOrder = 'ASC' } = query;
    
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient');

    if (date) {
      queryBuilder.andWhere('appointment.appointment_date = :date', { date });
    }

    if (patientId) {
      queryBuilder.andWhere('appointment.patient_id = :patientId', { patientId });
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    queryBuilder.orderBy('appointment.appointmentDate', sortOrder)
      .addOrderBy('appointment.startTime', 'ASC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!appointment) {
      throw new NotFoundException(`ไม่พบนัดหมายรหัส ${id}`);
    }
    return appointment;
  }

  async updateAppointment(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findAppointmentById(id);
    Object.assign(appointment, dto);
    return this.appointmentRepository.save(appointment);
  }

  async cancelAppointment(id: string): Promise<Appointment> {
    const appointment = await this.findAppointmentById(id);
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepository.save(appointment);
  }

  async checkInAppointment(id: string): Promise<{ appointment: Appointment; queue: Queue }> {
    const appointment = await this.findAppointmentById(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED && 
        appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('ไม่สามารถ check-in นัดหมายนี้ได้');
    }

    appointment.status = AppointmentStatus.CHECKED_IN;
    appointment.checkedInAt = new Date();
    await this.appointmentRepository.save(appointment);

    // Create queue
    const queue = await this.createQueue({
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      serviceType: appointment.type,
    });

    return { appointment, queue };
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const result = await this.findAllAppointments({ date: today, limit: 100 });
    return result.data;
  }

  // ====================
  // Queue Management
  // ====================

  private async getNextQueueNumber(date: Date, prefix: string): Promise<number> {
    const lastQueue = await this.queueRepository.findOne({
      where: {
        queueDate: date,
        queuePrefix: prefix,
      },
      order: { queueNumber: 'DESC' },
    });

    return lastQueue ? lastQueue.queueNumber + 1 : 1;
  }

  async createQueue(dto: CreateQueueDto): Promise<Queue> {
    const queueDate = dto.queueDate ? new Date(dto.queueDate) : new Date();
    const prefix = dto.queuePrefix || 'A';
    const queueNumber = await this.getNextQueueNumber(queueDate, prefix);

    const queue = this.queueRepository.create({
      ...dto,
      queueDate,
      queuePrefix: prefix,
      queueNumber,
      registeredAt: new Date(),
    });

    return this.queueRepository.save(queue);
  }

  async findTodayQueues(status?: QueueStatus): Promise<Queue[]> {
    const today = new Date().toISOString().split('T')[0];

    const queryBuilder = this.queueRepository
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.patient', 'patient')
      .where('queue.queue_date = :today', { today })
      .orderBy('queue.priority', 'ASC')
      .addOrderBy('queue.registeredAt', 'ASC');

    if (status) {
      queryBuilder.andWhere('queue.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async findWaitingQueues(): Promise<Queue[]> {
    return this.findTodayQueues(QueueStatus.WAITING);
  }

  async findQueueById(id: string): Promise<Queue> {
    const queue = await this.queueRepository.findOne({
      where: { id },
      relations: ['patient', 'appointment'],
    });
    if (!queue) {
      throw new NotFoundException(`ไม่พบคิวรหัส ${id}`);
    }
    return queue;
  }

  async callQueue(id: string, servicePoint?: string): Promise<Queue> {
    const queue = await this.findQueueById(id);

    if (queue.status !== QueueStatus.WAITING) {
      throw new BadRequestException('คิวนี้ไม่อยู่ในสถานะรอ');
    }

    queue.status = QueueStatus.CALLED;
    queue.calledAt = new Date();
    if (servicePoint) {
      queue.servicePoint = servicePoint;
    }

    return this.queueRepository.save(queue);
  }

  async startService(id: string): Promise<Queue> {
    const queue = await this.findQueueById(id);

    if (queue.status !== QueueStatus.CALLED) {
      throw new BadRequestException('กรุณาเรียกคิวก่อน');
    }

    queue.status = QueueStatus.IN_SERVICE;
    queue.startedAt = new Date();

    // Update appointment status if linked
    if (queue.appointmentId) {
      await this.appointmentRepository.update(queue.appointmentId, {
        status: AppointmentStatus.IN_PROGRESS,
        startedAt: new Date(),
      });
    }

    return this.queueRepository.save(queue);
  }

  async completeService(id: string): Promise<Queue> {
    const queue = await this.findQueueById(id);

    if (queue.status !== QueueStatus.IN_SERVICE) {
      throw new BadRequestException('คิวนี้ยังไม่ได้เริ่มให้บริการ');
    }

    queue.status = QueueStatus.COMPLETED;
    queue.completedAt = new Date();

    // Update appointment status if linked
    if (queue.appointmentId) {
      await this.appointmentRepository.update(queue.appointmentId, {
        status: AppointmentStatus.COMPLETED,
        completedAt: new Date(),
      });
    }

    return this.queueRepository.save(queue);
  }

  async skipQueue(id: string): Promise<Queue> {
    const queue = await this.findQueueById(id);
    queue.status = QueueStatus.SKIPPED;
    return this.queueRepository.save(queue);
  }

  async getCurrentQueue(): Promise<Queue | null> {
    const today = new Date().toISOString().split('T')[0];

    return this.queueRepository.findOne({
      where: {
        queueDate: new Date(today),
        status: QueueStatus.IN_SERVICE,
      },
      relations: ['patient'],
    });
  }

  async getQueueStatistics(): Promise<{
    waiting: number;
    inService: number;
    completed: number;
    avgWaitTime: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const waiting = await this.queueRepository.count({
      where: { queueDate: new Date(today), status: QueueStatus.WAITING },
    });

    const inService = await this.queueRepository.count({
      where: { queueDate: new Date(today), status: QueueStatus.IN_SERVICE },
    });

    const completed = await this.queueRepository.count({
      where: { queueDate: new Date(today), status: QueueStatus.COMPLETED },
    });

    // Calculate average wait time
    const avgResult = await this.queueRepository
      .createQueryBuilder('queue')
      .select('AVG(EXTRACT(EPOCH FROM (queue.called_at - queue.registered_at)))', 'avgWait')
      .where('queue.queue_date = :today', { today })
      .andWhere('queue.called_at IS NOT NULL')
      .getRawOne();

    const avgWaitTime = Math.round((avgResult?.avgWait || 0) / 60); // in minutes

    return { waiting, inService, completed, avgWaitTime };
  }
}
