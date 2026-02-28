import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateCountryDto {
  @IsNumber()
  continent_id!: number;

  @IsString()
  name!: string;

  @IsNumber()
  population!: number;

  @IsNumber()
  net_area!: number;

  @IsArray()
  @IsString({ each: true })
  political_system!: string[];

  @IsObject()
  economical_index!: Record<string, number>;

  @IsArray()
  @IsString({ each: true })
  languages!: string[];
}
