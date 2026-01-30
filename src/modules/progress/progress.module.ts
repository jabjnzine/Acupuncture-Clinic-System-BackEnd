import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { TreatmentProgress } from './entities/treatment-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TreatmentProgress])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
