import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContinentModule } from './continent/continent.module';
import { CityModule } from './city/city.module';
import { CountryModule } from './country/country.module';
import { ChainModule } from './chain/chain.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const isDevelopment = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV !== 'development' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ContinentModule,
    CityModule,
    CountryModule,
    ChainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
