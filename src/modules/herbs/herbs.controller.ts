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
import { HerbsService } from './herbs.service';
import {
  CreateHerbDto,
  UpdateHerbDto,
  CreatePrescriptionDto,
  CreateStockMovementDto,
  QueryHerbDto,
  QueryPrescriptionDto,
} from './dto';

@Controller('herbs')
export class HerbsController {
  constructor(private readonly herbsService: HerbsService) {}

  // ====================
  // Herbs
  // ====================

  @Post()
  async createHerb(@Body() dto: CreateHerbDto) {
    const herb = await this.herbsService.createHerb(dto);
    return {
      success: true,
      message: 'เพิ่มสมุนไพรสำเร็จ',
      data: herb,
    };
  }

  @Get()
  async findAllHerbs(@Query() query: QueryHerbDto) {
    const result = await this.herbsService.findAllHerbs(query);
    return { success: true, ...result };
  }

  @Get('categories')
  async getCategories() {
    const data = await this.herbsService.getHerbCategories();
    return { success: true, data };
  }

  @Get('low-stock')
  async getLowStock() {
    const data = await this.herbsService.getLowStockHerbs();
    return { success: true, data };
  }

  @Get('statistics')
  async getStatistics() {
    const data = await this.herbsService.getHerbStatistics();
    return { success: true, data };
  }

  @Get(':id')
  async findHerb(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.herbsService.findHerbById(id);
    return { success: true, data };
  }

  @Patch(':id')
  async updateHerb(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHerbDto,
  ) {
    const data = await this.herbsService.updateHerb(id, dto);
    return {
      success: true,
      message: 'แก้ไขสมุนไพรสำเร็จ',
      data,
    };
  }

  @Delete(':id')
  async deleteHerb(@Param('id', ParseUUIDPipe) id: string) {
    await this.herbsService.deleteHerb(id);
    return {
      success: true,
      message: 'ลบสมุนไพรสำเร็จ',
    };
  }

  // ====================
  // Prescriptions
  // ====================

  @Post('prescriptions')
  async createPrescription(@Body() dto: CreatePrescriptionDto) {
    const prescription = await this.herbsService.createPrescription(dto);
    return {
      success: true,
      message: `สร้างใบสั่งยา ${prescription.prescriptionNumber} สำเร็จ`,
      data: prescription,
    };
  }

  @Get('prescriptions')
  async findAllPrescriptions(@Query() query: QueryPrescriptionDto) {
    const result = await this.herbsService.findAllPrescriptions(query);
    return { success: true, ...result };
  }

  @Get('prescriptions/:id')
  async findPrescription(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.herbsService.findPrescriptionById(id);
    return { success: true, data };
  }

  @Post('prescriptions/:id/dispense')
  async dispensePrescription(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.herbsService.dispensePrescription(id);
    return {
      success: true,
      message: 'จ่ายยาสำเร็จ',
      data,
    };
  }

  @Post('prescriptions/:id/cancel')
  async cancelPrescription(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.herbsService.cancelPrescription(id);
    return {
      success: true,
      message: 'ยกเลิกใบสั่งยาสำเร็จ',
      data,
    };
  }

  // ====================
  // Stock Movements
  // ====================

  @Post('stock-movements')
  async createStockMovement(@Body() dto: CreateStockMovementDto) {
    const movement = await this.herbsService.createStockMovement(dto);
    return {
      success: true,
      message: 'บันทึกการเคลื่อนไหวสต๊อกสำเร็จ',
      data: movement,
    };
  }

  @Get('stock-movements')
  async getStockMovements(
    @Query('herbId') herbId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.herbsService.getStockMovements(herbId, startDate, endDate);
    return { success: true, data };
  }

  // ====================
  // Formulas
  // ====================

  @Get('formulas')
  async findAllFormulas(@Query('category') category?: string) {
    const data = await this.herbsService.findAllFormulas(category);
    return { success: true, data };
  }

  @Get('formulas/:id')
  async findFormula(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.herbsService.findFormulaById(id);
    return { success: true, data };
  }
}
