import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './country.entity';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { Continent } from '../continent/continent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country, Continent])],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
