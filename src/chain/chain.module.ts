import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContinentModule } from '../continent/continent.module';
import { CountryModule } from '../country/country.module';
import { CityModule } from '../city/city.module';
import { ChainService } from './chain.service';
import { ChainController } from './chain.controller';
import { ChainResult } from './chain-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChainResult]), ContinentModule, CountryModule, CityModule],
  providers: [ChainService],
  controllers: [ChainController],
})
export class ChainModule {}
