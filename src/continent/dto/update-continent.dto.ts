import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class UpdateContinentDto {
  @ApiPropertyOptional({
    description: 'The name of the continent',
    example: 'Africa',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Total surface area in square kilometers',
    example: 30370000,
  })
  @IsOptional()
  @IsNumber()
  net_area?: number;

  @ApiPropertyOptional({
    description: 'Chemical composition and rock types',
    example: ['Precambrian shield', 'Sedimentary basins'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geology?: string[];

  @ApiPropertyOptional({
    description: 'Tectonic structure and organization',
    example: ['Cratons', 'Rift valleys'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  structure?: string[];

  @ApiPropertyOptional({
    description: 'Rate of change in area, geology and structure',
    example: 0.02,
  })
  @IsOptional()
  @IsNumber()
  change_ratio?: number;

  @ApiPropertyOptional({
    description: 'Total population living on the continent',
    example: 1400000000,
  })
  @IsOptional()
  @IsNumber()
  population?: number;
}
