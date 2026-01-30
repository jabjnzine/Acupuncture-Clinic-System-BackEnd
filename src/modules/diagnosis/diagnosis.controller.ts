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
import { DiagnosisService } from './diagnosis.service';
import { CreateDiagnosisDto, UpdateDiagnosisDto, QueryDiagnosisDto } from './dto';

@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  async create(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    const diagnosis = await this.diagnosisService.create(createDiagnosisDto);
    return {
      success: true,
      message: 'บันทึกการวินิจฉัยสำเร็จ',
      data: diagnosis,
    };
  }

  @Get()
  async findAll(@Query() query: QueryDiagnosisDto) {
    const result = await this.diagnosisService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    const data = await this.diagnosisService.findByPatient(patientId);
    return {
      success: true,
      data,
    };
  }

  @Get('recent')
  async getRecent(@Query('limit') limit?: number) {
    const data = await this.diagnosisService.getRecentDiagnoses(limit || 10);
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.diagnosisService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto,
  ) {
    const data = await this.diagnosisService.update(id, updateDiagnosisDto);
    return {
      success: true,
      message: 'แก้ไขการวินิจฉัยสำเร็จ',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.diagnosisService.remove(id);
    return {
      success: true,
      message: 'ลบการวินิจฉัยสำเร็จ',
    };
  }
}
