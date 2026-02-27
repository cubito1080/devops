import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContinentModule } from './continent/continent.module';
import { CityModule } from './city/city.module';
import { CountryModule } from './country/country.module';

@Module({
  imports: [ContinentModule, CityModule, CountryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
