import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HerbsController } from './herbs.controller';
import { HerbsService } from './herbs.service';
import { Herb } from './entities/herb.entity';
import { HerbalFormula } from './entities/herbal-formula.entity';
import { Prescription } from './entities/prescription.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Herb, HerbalFormula, Prescription, StockMovement]),
  ],
  controllers: [HerbsController],
  providers: [HerbsService],
  exports: [HerbsService],
})
export class HerbsModule {}
