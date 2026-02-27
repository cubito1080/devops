import {
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateCityDto {
  @IsOptional()
  @IsNumber()
  country_id?: number;

  @IsOptional()
  @IsString()
  city_name?: string;

  @IsOptional()
  @IsObject()
  economical_index?: Record<string, number>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsNumber()
  population?: number;

  @IsOptional()
  @IsNumber()
  net_area?: number;
}
