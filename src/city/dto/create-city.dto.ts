import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({
    description: 'ID of the country this city belongs to',
    example: 7,
  })
  @IsNumber()
  country_id!: number;

  @ApiProperty({
    description: 'The name of the city',
    example: 'São Paulo',
  })
  @IsString()
  city_name!: string;

  @ApiProperty({
    description:
      'Key economic sectors and their contribution as a percentage of the city GDP',
    example: { finance: 32.5, industry: 22.1, services: 45.4 },
  })
  @IsObject()
  economical_index!: Record<string, number>;

  @ApiProperty({
    description: 'Languages spoken in the city',
    example: ['Portuguese', 'Spanish'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  languages!: string[];

  @ApiProperty({
    description: 'Total population of the city',
    example: 12325232,
  })
  @IsNumber()
  population!: number;

  @ApiProperty({
    description: 'Total surface area of the city in square kilometers',
    example: 1521,
  })
  @IsNumber()
  net_area!: number;
}
