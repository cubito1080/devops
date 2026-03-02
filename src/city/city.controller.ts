import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { CityService } from './city.service';
import { City } from './city.entity';
import { CreateCityDto } from './dto/create-city.dto';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  create(@Body() dto: CreateCityDto): Promise<City> {
    return this.cityService.create(dto);
  }

  @Get()
  findAll(): Promise<City[]> {
    return this.cityService.findAll();
  }
}