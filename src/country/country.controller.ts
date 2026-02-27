import {
    Controller,
    Get,
    Post, 
    Put,
    Delete,
    Body,
    Param
} from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './country.entity';

@Controller('countries')
export class CountryController {
  contructor(private readonly CountryService: CountryService){
}}
