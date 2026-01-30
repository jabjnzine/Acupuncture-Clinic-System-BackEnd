import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { Package } from './entities/package.entity';
import { PatientPackage } from './entities/patient-package.entity';
import { PackageUsage } from './entities/package-usage.entity';
import { Patient } from '../patients/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Package, PatientPackage, PackageUsage, Patient]),
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}

