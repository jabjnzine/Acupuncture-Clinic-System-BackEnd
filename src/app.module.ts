import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig, jwtConfig } from './config';
import { PatientsModule } from './modules/patients';
import { DiagnosisModule } from './modules/diagnosis';
import { TreatmentsModule } from './modules/treatments';
import { HerbsModule } from './modules/herbs';
import { AppointmentsModule } from './modules/appointments';
import { FinancialModule } from './modules/financial';
import { ReportsModule } from './modules/reports';
import { ProgressModule } from './modules/progress';
import { FilesModule } from './modules/files';
import { AuthModule } from './modules/auth';
import { DatabaseModule } from './database';
import { ServicesModule } from './modules/services/services.module';
import { PackagesModule } from './modules/packages/packages.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    PatientsModule,
    DiagnosisModule,
    TreatmentsModule,
    HerbsModule,
    AppointmentsModule,
    FinancialModule,
    ReportsModule,
    ProgressModule,
    FilesModule,
    AuthModule,
    DatabaseModule,
    ServicesModule,
    PackagesModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
