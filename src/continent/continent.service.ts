import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Continent } from './continent.entity';

@Injectable()
export class ContinentService {
  constructor(
    @InjectRepository(Continent)
    private continentRepository: Repository<Continent>,
  ) {}
}
