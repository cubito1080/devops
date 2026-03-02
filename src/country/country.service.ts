import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './country.entity';
import { CreateCountryDto } from './dto/create-continent.dto';
import { Continent } from '../continent/continent.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Continent)
    private readonly continentRepository: Repository<Continent>,
  ) {}

  async create(dto: CreateCountryDto): Promise<Country> {
    const continent = await this.continentRepository.findOne({
      where: { continent_id: dto.continent_id },
    });

    if (!continent) {
      throw new NotFoundException(
        `Continent with id ${dto.continent_id} does not exist`,
      );
    }

    const name_checker = await this.countryRepository.findOne({
      where: { name: dto.name },
    });

    if (name_checker) {
      throw new ConflictException(
        `Country with this ${dto.name} already exists`,
      );
    }

    const country = this.countryRepository.create({
      ...dto,
      continent,
    });
    return await this.countryRepository.save(country);
  }

  async findAll(): Promise<Country[]> {
    return await this.countryRepository.find({ relations: ['continent'] });
  }

  async findOne(id: number): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { country_id: id },
      relations: ['continent'],
    });
    if (!country) {
      throw new NotFoundException(`Country with id ${id} does not exist`);
    }
    return country;
  }
}