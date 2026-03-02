import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateCityDto {
  @ApiPropertyOptional({
    description: 'ID of the country this city belongs to',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  country_id?: number;

  @ApiPropertyOptional({
    description: 'The name of the city',
    example: 'São Paulo',
  })
  @IsOptional()
  @IsString()
  city_name?: string;

  @ApiPropertyOptional({
    description: 'Economic sectors and their GDP contribution percentage',
    example: { finance: 32.5, industry: 22.1, services: 45.4 },
  })
  @IsOptional()
  @IsObject()
  economical_index?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Languages spoken in the city',
    example: ['Portuguese', 'Spanish'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({
    description: 'Total population of the city',
    example: 12325232,
  })
  @IsOptional()
  @IsNumber()
  population?: number;

  @ApiPropertyOptional({
    description: 'Total surface area in square kilometers',
    example: 1521,
  })
  @IsOptional()
  @IsNumber()
  net_area?: number;
}
