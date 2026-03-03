import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCountryDto {
  @ApiPropertyOptional({
    description: 'ID of the continent this country belongs to',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  continent_id?: number;

  @ApiPropertyOptional({
    description: 'The name of the country',
    example: 'Brazil',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Total population of the country',
    example: 215000000,
  })
  @IsOptional()
  @IsNumber()
  population?: number;

  @ApiPropertyOptional({
    description: 'Total surface area in square kilometers',
    example: 8515767,
  })
  @IsOptional()
  @IsNumber()
  net_area?: number;

  @ApiPropertyOptional({
    description: 'Characteristics of the political system',
    example: ['Federal republic', 'Presidential system'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  political_system?: string[];

  @ApiPropertyOptional({
    description: 'Economic sectors and their GDP contribution percentage',
    example: { agriculture: 6.8, industry: 17.9, services: 75.3 },
  })
  @IsOptional()
  @IsObject()
  economical_index?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Official and widely spoken languages in the country',
    example: ['Portuguese'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}
