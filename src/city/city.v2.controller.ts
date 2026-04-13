import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CityService } from './city.service';
import { City } from './city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@ApiTags('Cities v2')
@Controller('api/v2/cities')
export class CityV2Controller {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @ApiOperation({ summary: '[v2] Create a city' })
  @ApiBody({ type: CreateCityDto })
  @ApiResponse({ status: 201, description: 'City created', type: City })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  @ApiResponse({ status: 409, description: 'City name already exists in this country' })
  create(@Body() dto: CreateCityDto): Promise<City> {
    return this.cityService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[v2] Get all cities' })
  @ApiResponse({ status: 200, description: 'List of all cities', type: [City] })
  findAll(): Promise<City[]> {
    return this.cityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '[v2] Get a city by id' })
  @ApiParam({ name: 'id', description: 'City numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'City found', type: City })
  @ApiResponse({ status: 400, description: 'id is not a number' })
  @ApiResponse({ status: 404, description: 'City not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<City> {
    return this.cityService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[v2] Update a city by id' })
  @ApiParam({ name: 'id', description: 'City numeric id', example: 1 })
  @ApiBody({ type: UpdateCityDto })
  @ApiResponse({ status: 200, description: 'City updated', type: City })
  @ApiResponse({ status: 400, description: 'Validation failed or id is not a number' })
  @ApiResponse({ status: 404, description: 'City or country not found' })
  @ApiResponse({ status: 409, description: 'City name already exists in this country' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCityDto,
  ): Promise<City> {
    return this.cityService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '[v2] Replace a city by id (all fields required)' })
  @ApiParam({ name: 'id', description: 'City numeric id', example: 1 })
  @ApiBody({ type: CreateCityDto })
  @ApiResponse({ status: 200, description: 'City replaced', type: City })
  @ApiResponse({ status: 400, description: 'Validation failed or id is not a number' })
  @ApiResponse({ status: 404, description: 'City or country not found' })
  @ApiResponse({ status: 409, description: 'City name already exists in this country' })
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCityDto,
  ): Promise<City> {
    return this.cityService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[v2] Delete a city by id' })
  @ApiParam({ name: 'id', description: 'City numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'City deleted' })
  @ApiResponse({ status: 400, description: 'id is not a number' })
  @ApiResponse({ status: 404, description: 'City not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.cityService.remove(id);
  }
}
