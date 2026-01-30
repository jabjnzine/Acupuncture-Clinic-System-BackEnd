import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CreateQueueDto,
  QueryAppointmentDto,
} from './dto';
import { AppointmentStatus } from './entities/appointment.entity';
import { QueueStatus } from './entities/queue.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ====================
  // Appointments
  // ====================

  @Post()
  async createAppointment(@Body() dto: CreateAppointmentDto) {
    const appointment = await this.appointmentsService.createAppointment(dto);
    return {
      success: true,
      message: 'สร้างนัดหมายสำเร็จ',
      data: appointment,
    };
  }

  @Get()
  async findAllAppointments(@Query() query: QueryAppointmentDto) {
    const result = await this.appointmentsService.findAllAppointments(query);
    return { success: true, ...result };
  }

  @Get('today')
  async getTodayAppointments() {
    const data = await this.appointmentsService.getTodayAppointments();
    return { success: true, data };
  }

  @Get(':id')
  async findAppointment(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.appointmentsService.findAppointmentById(id);
    return { success: true, data };
  }

  @Patch(':id')
  async updateAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    const data = await this.appointmentsService.updateAppointment(id, dto);
    return {
      success: true,
      message: 'แก้ไขนัดหมายสำเร็จ',
      data,
    };
  }

  @Post(':id/cancel')
  async cancelAppointment(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.appointmentsService.cancelAppointment(id);
    return {
      success: true,
      message: 'ยกเลิกนัดหมายสำเร็จ',
      data,
    };
  }

  @Post(':id/check-in')
  async checkInAppointment(@Param('id', ParseUUIDPipe) id: string) {
    const { appointment, queue } = await this.appointmentsService.checkInAppointment(id);
    return {
      success: true,
      message: `Check-in สำเร็จ คิว ${queue.queuePrefix}${queue.queueNumber.toString().padStart(3, '0')}`,
      data: { appointment, queue },
    };
  }

  // ====================
  // Queue
  // ====================

  @Post('queue')
  async createQueue(@Body() dto: CreateQueueDto) {
    const queue = await this.appointmentsService.createQueue(dto);
    return {
      success: true,
      message: `ออกคิว ${queue.queuePrefix}${queue.queueNumber.toString().padStart(3, '0')} สำเร็จ`,
      data: queue,
    };
  }

  @Get('queue/today')
  async getTodayQueues(@Query('status') status?: QueueStatus) {
    const data = await this.appointmentsService.findTodayQueues(status);
    return { success: true, data };
  }

  @Get('queue/waiting')
  async getWaitingQueues() {
    const data = await this.appointmentsService.findWaitingQueues();
    return { success: true, data };
  }

  @Get('queue/current')
  async getCurrentQueue() {
    const data = await this.appointmentsService.getCurrentQueue();
    return { success: true, data };
  }

  @Get('queue/statistics')
  async getQueueStatistics() {
    const data = await this.appointmentsService.getQueueStatistics();
    return { success: true, data };
  }

  @Get('queue/:id')
  async findQueue(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.appointmentsService.findQueueById(id);
    return { success: true, data };
  }

  @Post('queue/:id/call')
  async callQueue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('servicePoint') servicePoint?: string,
  ) {
    const data = await this.appointmentsService.callQueue(id, servicePoint);
    return {
      success: true,
      message: `เรียกคิว ${data.queuePrefix}${data.queueNumber.toString().padStart(3, '0')}`,
      data,
    };
  }

  @Post('queue/:id/start')
  async startService(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.appointmentsService.startService(id);
    return {
      success: true,
      message: 'เริ่มให้บริการ',
      data,
    };
  }

  @Post('queue/:id/complete')
  async completeService(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.appointmentsService.completeService(id);
    return {
      success: true,
      message: 'เสร็จสิ้นการให้บริการ',
      data,
    };
  }

  @Post('queue/:id/skip')
  async skipQueue(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.appointmentsService.skipQueue(id);
    return {
      success: true,
      message: 'ข้ามคิวสำเร็จ',
      data,
    };
  }
}
