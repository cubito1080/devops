import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Continent } from './continent.entity';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';

@Injectable()
export class ContinentService {
  constructor(
    @InjectRepository(Continent)
    private continentRepository: Repository<Continent>,
  ) {}

  async create(dto: CreateContinentDto): Promise<Continent> {
    const checker = await this.continentRepository.findOne({
      where: { name: dto.name },
    });

    if (checker) {
      throw new ConflictException(
        \Continent with this \ already exists\,
      );
    }
    const continent = this.continentRepository.create(dto);

    return await this.continentRepository.save(continent);
  }

  async findAll(): Promise<Continent[]> {
    return await this.continentRepository.find();
  }

  async findOne(id: number): Promise<Continent> {
    const continent = await this.continentRepository.findOne({
      where: { continent_id: id },
    });

    if (!continent) {
      throw new NotFoundException(\Continent with id \ does not exist\);
    }
    return continent;
  }

  async update(id: number, dto: UpdateContinentDto): Promise<Continent> {
    const continent = await this.continentRepository.findOne({
      where: { continent_id: id },
    });
    if (!continent) {
      throw new NotFoundException(\Continent with id \ does not exist\);
    }

    if (dto.name && dto.name !== continent.name) {
      const checker = await this.continentRepository.findOne({
        where: { name: dto.name },
      });
      if (checker) {
        throw new ConflictException(
          \Continent with this \ already exists\,
        );
      }
    }
    Object.assign(continent, dto);
    return await this.continentRepository.save(continent);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.continentRepository.delete(id);

    return { message: \Continent with id \ has been deleted\ };
  }
}
