import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Continent } from './continent.entity';
import { ContinentController } from './continent.controller';
import { ContinentV2Controller } from './continent.v2.controller';
import { ContinentService } from './continent.service';

@Module({
  imports: [TypeOrmModule.forFeature([Continent])],
  controllers: [ContinentController, ContinentV2Controller],
  providers: [ContinentService],
  exports: [ContinentService],
})
export class ContinentModule {}
