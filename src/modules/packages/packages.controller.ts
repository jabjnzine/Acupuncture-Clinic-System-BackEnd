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
import { PackagesService } from './packages.service';
import {
  CreatePackageDto,
  UpdatePackageDto,
  CreatePatientPackageDto,
  UsePackageSessionDto,
} from './dto';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // ==================== Packages ====================

  @Post()
  async createPackage(@Body() dto: CreatePackageDto) {
    const pkg = await this.packagesService.createPackage(dto);
    return {
      success: true,
      message: `สร้างแพ็คเกจ ${pkg.name} สำเร็จ`,
      data: pkg,
    };
  }

  @Get()
  async findAllPackages(
    @Query('activeOnly') activeOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const result = await this.packagesService.findAllPackages(
      activeOnly === 'true',
      pageNum,
      limitNum,
    );
    return { success: true, ...result };
  }

  // Note: This route MUST come before :id route to avoid UUID validation
  @Get('all-patient-packages')
  async findAllPatientPackages(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('month') month?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '50', 10);
    const result = await this.packagesService.findAllPatientPackages({
      page: pageNum,
      limit: limitNum,
      status,
      month,
    });
    return { success: true, ...result };
  }

  @Get(':id')
  async findPackage(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.packagesService.findPackageById(id);
    return { success: true, data };
  }

  @Patch(':id')
  async updatePackage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    const data = await this.packagesService.updatePackage(id, dto);
    return {
      success: true,
      message: 'แก้ไขแพ็คเกจสำเร็จ',
      data,
    };
  }

  @Delete(':id')
  async removePackage(@Param('id', ParseUUIDPipe) id: string) {
    await this.packagesService.removePackage(id);
    return {
      success: true,
      message: 'ลบแพ็คเกจสำเร็จ',
    };
  }

  // ==================== Patient Packages ====================

  @Post('purchase')
  async purchasePackage(@Body() dto: CreatePatientPackageDto) {
    const data = await this.packagesService.purchasePackage(dto);
    return {
      success: true,
      message: 'ซื้อแพ็คเกจสำเร็จ',
      data,
    };
  }

  @Get('patient/:patientId')
  async findPatientPackages(@Param('patientId', ParseUUIDPipe) patientId: string) {
    const data = await this.packagesService.findPatientPackages(patientId);
    return { success: true, data };
  }

  @Get('patient/:patientId/active')
  async findActivePatientPackages(
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    const data = await this.packagesService.findActivePatientPackages(patientId);
    return { success: true, data };
  }

  @Get('patient-package/:id')
  async findPatientPackage(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.packagesService.findPatientPackageById(id);
    return { success: true, data };
  }

  // ==================== Package Usage ====================

  @Post('use')
  async useSession(@Body() dto: UsePackageSessionDto) {
    const data = await this.packagesService.useSession(dto);
    return {
      success: true,
      message: 'บันทึกการใช้คอร์สสำเร็จ',
      data,
    };
  }

  @Get('patient-package/:id/usages')
  async getPackageUsages(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.packagesService.getPackageUsages(id);
    return { success: true, data };
  }
}
