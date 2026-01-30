import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';
import { Treatment } from './entities/treatment.entity';
import { Acupoint } from './entities/acupoint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Treatment, Acupoint])],
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
  exports: [TreatmentsService],
})
export class TreatmentsModule {}
