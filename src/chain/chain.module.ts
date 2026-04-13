import { Module } from '@nestjs/common';
import { ContinentModule } from '../continent/continent.module';
import { CountryModule } from '../country/country.module';
import { CityModule } from '../city/city.module';
import { ChainService } from './chain.service';
import { ChainController } from './chain.controller';

@Module({
  imports: [ContinentModule, CountryModule, CityModule],
  providers: [ChainService],
  controllers: [ChainController],
})
export class ChainModule {}
