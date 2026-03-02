import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
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

  async findAll(): Promise<City[]> {
    return await this.cityRepository.find({ relations: ['country'] });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { city_id: id },
      relations: ['country'],
    });
    if (!city) {
      throw new NotFoundException(`City with id ${id} does not exist`);
    }
    return city;
  }

  async update(id: number, dto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);

    if (dto.country_id && dto.country_id !== city.country.country_id) {
      const country = await this.countryRepository.findOne({
        where: { country_id: dto.country_id },
      });

      if (!country) {
        throw new NotFoundException(
          `Country with id ${dto.country_id} does not exist`,
        );
      }
      city.country = country;
    }

    if (dto.city_name && dto.city_name !== city.city_name) {
      const existingCity = await this.cityRepository.findOne({
        where: { city_name: dto.city_name },
      });

      if (existingCity) {
        throw new ConflictException(
          `City with name "${dto.city_name}" already exists`,
        );
      }
    }

    const { country_id: _, ...fieldToUpdate } = dto;

    Object.assign(city, fieldToUpdate);
    return await this.cityRepository.save(city);
  }
}