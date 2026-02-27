import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { city } from './city.entity';

@Inyectable()
export class CityService {
  constructor(
    @inyectRepository(City)
    private cityRepository: Repository<City>,
  ) {}
}
