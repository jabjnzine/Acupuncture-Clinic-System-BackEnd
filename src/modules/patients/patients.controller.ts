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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import {
  CreatePatientDto,
  UpdatePatientDto,
  QueryPatientDto,
} from './dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * สร้างผู้ป่วยใหม่
   */
  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    const patient = await this.patientsService.create(createPatientDto);
    return {
      success: true,
      message: 'ลงทะเบียนผู้ป่วยสำเร็จ',
      data: patient,
    };
  }

  /**
   * ดึงรายการผู้ป่วยทั้งหมด
   */
  @Get()
  async findAll(@Query() query: QueryPatientDto) {
    const result = await this.patientsService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * สถิติผู้ป่วย
   */
  @Get('statistics')
  async getStatistics() {
    const stats = await this.patientsService.getStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * ค้นหาผู้ป่วยด้วย HN Number
   */
  @Get('hn/:hnNumber')
  async findByHnNumber(@Param('hnNumber') hnNumber: string) {
    const patient = await this.patientsService.findByHnNumber(hnNumber);
    return {
      success: true,
      data: patient,
    };
  }

  /**
   * ดึงข้อมูลผู้ป่วย
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const patient = await this.patientsService.findOne(id);
    return {
      success: true,
      data: patient,
    };
  }

  /**
   * แก้ไขข้อมูลผู้ป่วย
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    const patient = await this.patientsService.update(id, updatePatientDto);
    return {
      success: true,
      message: 'แก้ไขข้อมูลสำเร็จ',
      data: patient,
    };
  }

  /**
   * ลบผู้ป่วย (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.patientsService.remove(id);
    return {
      success: true,
      message: 'ลบข้อมูลผู้ป่วยสำเร็จ',
    };
  }
}
