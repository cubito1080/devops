import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ContinentService } from './continent.service';
import { Continent } from './continent.entity';

@Controller('continents')
export class ContinentController {
  constructor(private readonly continentService: ContinentService) {}
}
