import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../modules/auth/entities/user.entity';
import { Acupoint } from '../modules/treatments/entities/acupoint.entity';
import { Herb } from '../modules/herbs/entities/herb.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Acupoint, Herb])],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
