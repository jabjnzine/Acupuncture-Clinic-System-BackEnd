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
import { FilesService } from './files.service';
import { FileType } from './entities/file.entity';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    const data = await this.filesService.findByPatient(patientId);
    return { success: true, data };
  }

  @Get('reference')
  async findByReference(
    @Query('referenceId') referenceId: string,
    @Query('referenceType') referenceType: string,
  ) {
    const data = await this.filesService.findByReference(referenceId, referenceType);
    return { success: true, data };
  }

  @Get('backup-info')
  async getBackupInfo() {
    const data = await this.filesService.createBackupInfo();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.filesService.findOne(id);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.filesService.delete(id);
    return {
      success: true,
      message: 'ลบไฟล์สำเร็จ',
    };
  }

  // PDF Template endpoints
  @Post('templates/prescription')
  async getPrescriptionTemplate(
    @Body() data: {
      prescriptionNumber: string;
      patientName: string;
      date: string;
      items: { herbName: string; quantity: number; unit: string }[];
      instructions?: string;
    },
  ) {
    const html = this.filesService.generatePrescriptionPdfContent({
      ...data,
      date: new Date(data.date),
    });
    return { success: true, data: { html } };
  }

  @Post('templates/invoice')
  async getInvoiceTemplate(
    @Body() data: {
      invoiceNumber: string;
      patientName: string;
      date: string;
      items: { description: string; quantity: number; unitPrice: number; total: number }[];
      subtotal: number;
      discount: number;
      total: number;
    },
  ) {
    const html = this.filesService.generateInvoicePdfContent({
      ...data,
      date: new Date(data.date),
    });
    return { success: true, data: { html } };
  }
}
