import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CityService } from './city.service';
import { City } from './city.entity';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}
}
