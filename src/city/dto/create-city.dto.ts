import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateCityDto {
  @IsNumber()
  country_id!: number;

  @IsString()
  city_name!: string;

  @IsObject()
  economical_index!: Record<string, number>;

  @IsArray()
  @IsString({ each: true })
  languages!: string[];

  @IsNumber()
  population!: number;

  @IsNumber()
  net_area!: number;
}
