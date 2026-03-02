import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateContinentDto {
  @ApiProperty({
    description: 'The name of the continent',
    example: 'Africa',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Total surface area of the continent in square kilometers',
    example: 30370000,
  })
  @IsNumber()
  net_area!: number;

  @ApiProperty({
    description:
      'Chemical composition, rock types and age of geological material',
    example: ['Precambrian shield', 'Sedimentary basins', 'Volcanic rock'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  geology!: string[];

  @ApiProperty({
    description:
      'How tectonic pieces are organized and connected — structural geology',
    example: ['Cratons', 'Rift valleys', 'Fold belts'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  structure!: string[];

  @ApiProperty({
    description:
      'Fixed rate at which the continent changes in area, geology and structure',
    example: 0.02,
  })
  @IsNumber()
  change_ratio!: number;

  @ApiProperty({
    description: 'Total population living on the continent',
    example: 1400000000,
  })
  @IsNumber()
  population!: number;
}
