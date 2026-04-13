import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './city.entity';
import { Country } from '../country/country.entity';
import { CityController } from './city.controller';
import { CityV2Controller } from './city.v2.controller';
import { CityService } from './city.service';

@Module({
  imports: [TypeOrmModule.forFeature([City, Country])],
  controllers: [CityController, CityV2Controller],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
