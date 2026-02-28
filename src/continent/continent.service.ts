import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Continent } from './continent.entity';
import { CreateContinentDto } from './dto/create-continent.dto';

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
}
