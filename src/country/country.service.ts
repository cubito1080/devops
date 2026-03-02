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
import { UpdateCountryDto } from './dto/update-continent.dto';

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
    // type: Continent | null

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

  async update(id: number, dto: UpdateCountryDto): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { country_id: id },
    });

    if (!country) {
      throw new NotFoundException(`Country with id ${id} does not exist`);
    }

    if (dto.continent_id !== undefined) {
      const continent = await this.continentRepository.findOne({
        where: { continent_id: dto.continent_id },
      });
      if (!continent) {
        throw new NotFoundException(
          `Continent with id ${dto.continent_id} does not exist`,
        );
      }
      country.continent = continent;
    }

    if (dto.name && dto.name !== country.name) {
      const name_checker = await this.countryRepository.findOne({
        where: { name: dto.name },
      });
      if (name_checker) {
        throw new ConflictException(
          `Country with this ${dto.name} already exists`,
        );
      }
    }
    const { continent_id: _, ...fieldsToUpdate } = dto;
    Object.assign(country, fieldsToUpdate);
    return await this.countryRepository.save(country);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.countryRepository.delete(id);
    return { message: `Country with id ${id} has been deleted` };
  }
}
