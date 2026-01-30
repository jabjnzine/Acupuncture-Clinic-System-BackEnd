import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto';
import { Public, CurrentUser, Roles } from './decorators';
import { JwtAuthGuard, RolesGuard } from './guards';
import { User, UserRole } from './entities/user.entity';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { user, tokens } = await this.authService.register(dto);
    return {
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      data: { 
        user, 
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { user, tokens } = await this.authService.login(dto);
    return {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: { 
        user, 
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const tokens = await this.authService.refreshTokens(body.refreshToken);
    return {
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.authService.getProfile(user.id);
    return {
      success: true,
      data: profile,
    };
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.id, dto);
    return {
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    };
  }

  @Get('users')
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    const users = await this.authService.getAllUsers();
    return {
      success: true,
      data: users,
    };
  }
}
