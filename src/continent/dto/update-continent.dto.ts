import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class UpdateContinentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  net_area?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geology?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  structure?: string[];

  @IsOptional()
  @IsNumber()
  change_ratio?: number;

  @IsOptional()
  @IsNumber()
  population?: number;
}
