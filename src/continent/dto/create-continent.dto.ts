import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateContinentDto {
  @IsString()
  name!: string;

  @IsNumber()
  net_area!: number;

  @IsArray()
  @IsString({ each: true })
  geology!: string[];

  @IsArray()
  @IsString({ each: true })
  structure!: string[];

  @IsNumber()
  change_ratio!: number;

  @IsNumber()
  population!: number;
}
