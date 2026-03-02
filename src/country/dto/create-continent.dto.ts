import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({
    description: 'ID of the continent this country belongs to',
    example: 3,
  })
  @IsNumber()
  continent_id!: number;

  @ApiProperty({
    description: 'The name of the country',
    example: 'Brazil',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Total population of the country',
    example: 215000000,
  })
  @IsNumber()
  population!: number;

  @ApiProperty({
    description: 'Total surface area of the country in square kilometers',
    example: 8515767,
  })
  @IsNumber()
  net_area!: number;

  @ApiProperty({
    description:
      'List of characteristics that describe the political system of the country',
    example: ['Federal republic', 'Presidential system', 'Multi-party'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  political_system!: string[];

  @ApiProperty({
    description:
      'Key economic sectors and their contribution as a percentage of GDP',
    example: { agriculture: 6.8, industry: 17.9, services: 75.3 },
  })
  @IsObject()
  economical_index!: Record<string, number>;

  @ApiProperty({
    description: 'Official and widely spoken languages in the country',
    example: ['Portuguese'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  languages!: string[];
}
