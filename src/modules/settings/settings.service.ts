import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicSettings } from './entities/clinic-settings.entity';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ClinicSettings)
    private settingsRepository: Repository<ClinicSettings>,
  ) {}

  async getSettings(): Promise<ClinicSettings> {
    // Get existing settings or create default
    let settings = await this.settingsRepository.findOne({ where: {} });
    
    if (!settings) {
      settings = this.settingsRepository.create({
        clinicName: 'คลินิกแพทย์แผนจีน',
        notifyAppointment: true,
        notifyLowStock: true,
        notifyPendingPayment: false,
      });
      await this.settingsRepository.save(settings);
    }
    
    return settings;
  }

  async updateSettings(updateDto: UpdateClinicSettingsDto): Promise<ClinicSettings> {
    let settings = await this.getSettings();
    
    // Update with new values
    Object.assign(settings, updateDto);
    
    return this.settingsRepository.save(settings);
  }

  async updateNotifications(notifications: {
    notifyAppointment?: boolean;
    notifyLowStock?: boolean;
    notifyPendingPayment?: boolean;
  }): Promise<ClinicSettings> {
    const settings = await this.getSettings();
    
    if (notifications.notifyAppointment !== undefined) {
      settings.notifyAppointment = notifications.notifyAppointment;
    }
    if (notifications.notifyLowStock !== undefined) {
      settings.notifyLowStock = notifications.notifyLowStock;
    }
    if (notifications.notifyPendingPayment !== undefined) {
      settings.notifyPendingPayment = notifications.notifyPendingPayment;
    }
    
    return this.settingsRepository.save(settings);
  }
}
