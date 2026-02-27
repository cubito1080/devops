import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Continent } from './continent.entity';
import { ContinentController } from './continent.controller';
import { ContinentService } from './continent.service';
import { CannotGetEntityManagerNotConnectedError } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Continent])],
  controllers: [ContinentController],
  providers: [ContinentService],
})
export class ContinentModule {}
