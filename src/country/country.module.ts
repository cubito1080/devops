import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './country.entity';
import { CountryController } from './country.controller';
import { CountryV2Controller } from './country.v2.controller';
import { CountryService } from './country.service';
import { Continent } from '../continent/continent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country, Continent])],
  controllers: [CountryController, CountryV2Controller],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
