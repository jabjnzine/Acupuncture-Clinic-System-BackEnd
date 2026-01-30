import { Controller, Get, Patch, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      success: true,
      data: settings,
    };
  }

  @Patch()
  async updateSettings(@Body() updateDto: UpdateClinicSettingsDto) {
    const settings = await this.settingsService.updateSettings(updateDto);
    return {
      success: true,
      message: 'บันทึกการตั้งค่าสำเร็จ',
      data: settings,
    };
  }

  @Patch('notifications')
  async updateNotifications(
    @Body() notifications: {
      notifyAppointment?: boolean;
      notifyLowStock?: boolean;
      notifyPendingPayment?: boolean;
    },
  ) {
    const settings = await this.settingsService.updateNotifications(notifications);
    return {
      success: true,
      message: 'บันทึกการแจ้งเตือนสำเร็จ',
      data: settings,
    };
  }
}
