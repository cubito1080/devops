import { IsArray, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateCountryDto {
  @IsOptional()
  @IsNumber()
  continent_id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  population?: number;

  @IsOptional()
  @IsNumber()
  net_area?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  political_system?: string[];

  @IsOptional()
  @IsObject()
  economical_index?: Record<string, number>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}
