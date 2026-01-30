import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRecord, FileType } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private uploadDir = './uploads';

  constructor(
    @InjectRepository(FileRecord)
    private readonly fileRepository: Repository<FileRecord>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async createFileRecord(data: {
    originalName: string;
    storedName: string;
    type: FileType;
    mimeType?: string;
    size: number;
    path: string;
    patientId?: string;
    referenceId?: string;
    referenceType?: string;
    description?: string;
    uploadedBy?: string;
  }): Promise<FileRecord> {
    const fileRecord = this.fileRepository.create(data);
    return this.fileRepository.save(fileRecord);
  }

  async findByPatient(patientId: string): Promise<FileRecord[]> {
    return this.fileRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByReference(referenceId: string, referenceType: string): Promise<FileRecord[]> {
    return this.fileRepository.find({
      where: { referenceId, referenceType },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FileRecord> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`ไม่พบไฟล์ ${id}`);
    }
    return file;
  }

  async delete(id: string): Promise<void> {
    const file = await this.findOne(id);
    
    // Delete physical file if exists
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await this.fileRepository.delete(id);
  }

  // ====================
  // PDF Generation Helpers
  // ====================

  generatePrescriptionPdfContent(prescription: {
    prescriptionNumber: string;
    patientName: string;
    date: Date;
    items: { herbName: string; quantity: number; unit: string }[];
    instructions?: string;
  }): string {
    // Return HTML template for PDF generation
    const itemsHtml = prescription.items
      .map((item, i) => `<tr><td>${i + 1}</td><td>${item.herbName}</td><td>${item.quantity} ${item.unit}</td></tr>`)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ใบสั่งยา ${prescription.prescriptionNumber}</title>
        <style>
          body { font-family: 'Sarabun', sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .header { text-align: center; margin-bottom: 20px; }
          .footer { margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>คลินิกแพทย์แผนจีน</h1>
          <h2>ใบสั่งยาสมุนไพร</h2>
        </div>
        <p><strong>เลขที่:</strong> ${prescription.prescriptionNumber}</p>
        <p><strong>ผู้ป่วย:</strong> ${prescription.patientName}</p>
        <p><strong>วันที่:</strong> ${prescription.date.toLocaleDateString('th-TH')}</p>
        
        <table>
          <thead>
            <tr><th>ลำดับ</th><th>ชื่อสมุนไพร</th><th>จำนวน</th></tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        ${prescription.instructions ? `<p><strong>วิธีใช้:</strong> ${prescription.instructions}</p>` : ''}
        
        <div class="footer">
          <p>ลงชื่อ _________________________ แพทย์ผู้สั่ง</p>
        </div>
      </body>
      </html>
    `;
  }

  generateInvoicePdfContent(invoice: {
    invoiceNumber: string;
    patientName: string;
    date: Date;
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
    subtotal: number;
    discount: number;
    total: number;
  }): string {
    const itemsHtml = invoice.items
      .map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice.toLocaleString()}</td>
          <td>${item.total.toLocaleString()}</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ใบแจ้งหนี้ ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Sarabun', sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background: #f5f5f5; }
          .text-right { text-align: right; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>คลินิกแพทย์แผนจีน</h1>
          <h2>ใบแจ้งหนี้</h2>
        </div>
        <p><strong>เลขที่:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>ผู้ป่วย:</strong> ${invoice.patientName}</p>
        <p><strong>วันที่:</strong> ${invoice.date.toLocaleDateString('th-TH')}</p>
        
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>รายการ</th>
              <th>จำนวน</th>
              <th>ราคา/หน่วย</th>
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-right">ยอดรวม</td>
              <td>${invoice.subtotal.toLocaleString()} บาท</td>
            </tr>
            <tr>
              <td colspan="4" class="text-right">ส่วนลด</td>
              <td>${invoice.discount.toLocaleString()} บาท</td>
            </tr>
            <tr class="total-row">
              <td colspan="4" class="text-right">ยอดสุทธิ</td>
              <td>${invoice.total.toLocaleString()} บาท</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;
  }

  // ====================
  // Backup
  // ====================

  async createBackupInfo(): Promise<{
    databaseSize: string;
    fileCount: number;
    totalFileSize: string;
    lastBackup: Date | null;
  }> {
    const fileCount = await this.fileRepository.count();
    
    const sizeResult = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'total')
      .getRawOne();

    const totalBytes = parseInt(sizeResult?.total) || 0;
    const totalFileSize = this.formatBytes(totalBytes);

    return {
      databaseSize: 'N/A', // Would need direct DB connection
      fileCount,
      totalFileSize,
      lastBackup: null, // Would need backup tracking
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
