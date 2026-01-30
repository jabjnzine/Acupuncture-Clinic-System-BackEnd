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
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(@Body() dto: CreateServiceDto) {
    const service = await this.servicesService.create(dto);
    return {
      success: true,
      message: `สร้างบริการ ${service.name} สำเร็จ`,
      data: service,
    };
  }

  @Get()
  async findAll(
    @Query('activeOnly') activeOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const result = await this.servicesService.findAll(
      activeOnly === 'true',
      pageNum,
      limitNum,
    );
    return { success: true, ...result };
  }

  @Get('generate-code')
  async generateCode() {
    const code = await this.servicesService.generateCode();
    return { success: true, data: { code } };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.servicesService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    const data = await this.servicesService.update(id, dto);
    return {
      success: true,
      message: 'แก้ไขบริการสำเร็จ',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.servicesService.remove(id);
    return {
      success: true,
      message: 'ลบบริการสำเร็จ',
    };
  }
}
