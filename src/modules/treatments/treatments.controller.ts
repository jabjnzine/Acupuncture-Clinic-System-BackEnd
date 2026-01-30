import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto, UpdateTreatmentDto, QueryTreatmentDto } from './dto';

@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  // ====================
  // Treatment Endpoints
  // ====================

  @Post()
  async create(@Body() createTreatmentDto: CreateTreatmentDto) {
    const treatment = await this.treatmentsService.create(createTreatmentDto);
    return {
      success: true,
      message: 'บันทึกการรักษาสำเร็จ',
      data: treatment,
    };
  }

  @Get()
  async findAll(@Query() query: QueryTreatmentDto) {
    const result = await this.treatmentsService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    const data = await this.treatmentsService.findByPatient(patientId);
    return {
      success: true,
      data,
    };
  }

  @Get('patient/:patientId/history')
  async getPatientHistory(@Param('patientId', ParseUUIDPipe) patientId: string) {
    const data = await this.treatmentsService.getPatientTreatmentHistory(patientId);
    return {
      success: true,
      data,
    };
  }

  @Get('statistics')
  async getStatistics(@Query('patientId') patientId?: string) {
    const data = await this.treatmentsService.getTreatmentStatistics(patientId);
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.treatmentsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ) {
    const data = await this.treatmentsService.update(id, updateTreatmentDto);
    return {
      success: true,
      message: 'แก้ไขการรักษาสำเร็จ',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.treatmentsService.remove(id);
    return {
      success: true,
      message: 'ลบการรักษาสำเร็จ',
    };
  }

  // ====================
  // Acupoint Endpoints
  // ====================

  @Get('acupoints/all')
  async findAllAcupoints(
    @Query('meridian') meridian?: string,
    @Query('bodyRegion') bodyRegion?: string,
  ) {
    const data = await this.treatmentsService.findAllAcupoints(meridian, bodyRegion);
    return {
      success: true,
      data,
    };
  }

  @Get('acupoints/meridians')
  async getAcupointMeridians() {
    const data = await this.treatmentsService.getAcupointMeridians();
    return {
      success: true,
      data,
    };
  }

  @Get('acupoints/body-regions')
  async getAcupointBodyRegions() {
    const data = await this.treatmentsService.getAcupointBodyRegions();
    return {
      success: true,
      data,
    };
  }

  @Get('acupoints/meridian/:meridian')
  async findAcupointsByMeridian(@Param('meridian') meridian: string) {
    const data = await this.treatmentsService.findAcupointsByMeridian(meridian);
    return {
      success: true,
      data,
    };
  }

  @Get('acupoints/:code')
  async findAcupointByCode(@Param('code') code: string) {
    const data = await this.treatmentsService.findAcupointByCode(code);
    return {
      success: true,
      data,
    };
  }
}
