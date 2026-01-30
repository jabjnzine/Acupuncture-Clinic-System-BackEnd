import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  async create(@Body() dto: CreateProgressDto) {
    const progress = await this.progressService.create(dto);
    return {
      success: true,
      message: 'บันทึกความก้าวหน้าสำเร็จ',
      data: progress,
    };
  }

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    const data = await this.progressService.findByPatient(patientId);
    return { success: true, data };
  }

  @Get('patient/:patientId/trend')
  async getPatientTrend(@Param('patientId', ParseUUIDPipe) patientId: string) {
    const data = await this.progressService.getPatientTrend(patientId);
    return { success: true, data };
  }

  @Get('satisfaction')
  async getSatisfactionStats(@Query('patientId') patientId?: string) {
    const data = await this.progressService.getSatisfactionStats(patientId);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.progressService.findOne(id);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.progressService.delete(id);
    return {
      success: true,
      message: 'ลบบันทึกความก้าวหน้าสำเร็จ',
    };
  }
}
