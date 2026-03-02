import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { Country } from '../country/country.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,

    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async create(dto: CreateCityDto): Promise<City> {
    const country = await this.countryRepository.findOne({
      where: { country_id: dto.country_id },
    });

    if (!country) {
      throw new NotFoundException(
        `Country with id ${dto.country_id} does not exist`,
      );
    }
    const existingCity = await this.cityRepository.findOne({
      where: { city_name: dto.city_name },
    });

    if (existingCity) {
      throw new ConflictException(
        `City with name "${dto.city_name}" already exists`,
      );
    }
    const city = this.cityRepository.create({
      ...dto,
      country,
    });
    return await this.cityRepository.save(city);
  }
}