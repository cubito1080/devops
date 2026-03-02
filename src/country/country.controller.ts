import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './country.entity';
import { CreateCountryDto } from './dto/create-continent.dto';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  create(@Body() dto: CreateCountryDto): Promise<Country> {
    return this.countryService.create(dto);
  }

  @Get()
  findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Country> {
    return this.countryService.findOne(id);
  }
}