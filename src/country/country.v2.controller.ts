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
import { CountryService } from './country.service';
import { Country } from './country.entity';
import { CreateCountryDto } from './dto/create-continent.dto';
import { UpdateCountryDto } from './dto/update-continent.dto';

@ApiTags('Countries v2')
@Controller('api/v2/countries')
export class CountryV2Controller {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @ApiOperation({ summary: '[v2] Create a country' })
  @ApiBody({ type: CreateCountryDto })
  @ApiResponse({ status: 201, description: 'Country created', type: Country })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Continent not found' })
  @ApiResponse({ status: 409, description: 'Country name already exists' })
  create(@Body() dto: CreateCountryDto): Promise<Country> {
    return this.countryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[v2] Get all countries' })
  @ApiResponse({ status: 200, description: 'List of all countries', type: [Country] })
  findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '[v2] Get a country by id' })
  @ApiParam({ name: 'id', description: 'Country numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'Country found', type: Country })
  @ApiResponse({ status: 400, description: 'id is not a number' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Country> {
    return this.countryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[v2] Update a country by id' })
  @ApiParam({ name: 'id', description: 'Country numeric id', example: 1 })
  @ApiBody({ type: UpdateCountryDto })
  @ApiResponse({ status: 200, description: 'Country updated', type: Country })
  @ApiResponse({ status: 400, description: 'Validation failed or id is not a number' })
  @ApiResponse({ status: 404, description: 'Country or continent not found' })
  @ApiResponse({ status: 409, description: 'Country name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCountryDto,
  ): Promise<Country> {
    return this.countryService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '[v2] Replace a country by id (all fields required)' })
  @ApiParam({ name: 'id', description: 'Country numeric id', example: 1 })
  @ApiBody({ type: CreateCountryDto })
  @ApiResponse({ status: 200, description: 'Country replaced', type: Country })
  @ApiResponse({ status: 400, description: 'Validation failed or id is not a number' })
  @ApiResponse({ status: 404, description: 'Country or continent not found' })
  @ApiResponse({ status: 409, description: 'Country name already exists' })
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCountryDto,
  ): Promise<Country> {
    return this.countryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[v2] Delete a country by id' })
  @ApiParam({ name: 'id', description: 'Country numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'Country deleted' })
  @ApiResponse({ status: 400, description: 'id is not a number' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.countryService.remove(id);
  }
}
