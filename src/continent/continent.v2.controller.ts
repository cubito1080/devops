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
import { ContinentService } from './continent.service';
import { Continent } from './continent.entity';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';

@ApiTags('Continents v2')
@Controller('api/v2/continents')
export class ContinentV2Controller {
  constructor(private readonly continentService: ContinentService) {}

  @Post()
  @ApiOperation({ summary: '[v2] Create a continent' })
  @ApiBody({ type: CreateContinentDto })
  @ApiResponse({ status: 201, description: 'Continent created', type: Continent })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Continent name already exists' })
  create(@Body() dto: CreateContinentDto): Promise<Continent> {
    return this.continentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[v2] Get all continents' })
  @ApiResponse({ status: 200, description: 'List of all continents', type: [Continent] })
  findAll(): Promise<Continent[]> {
    return this.continentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '[v2] Get a continent by id' })
  @ApiParam({ name: 'id', description: 'Continent numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'Continent found', type: Continent })
  @ApiResponse({ status: 400, description: 'id is not a number' })
  @ApiResponse({ status: 404, description: 'Continent not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Continent> {
    return this.continentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[v2] Update a continent by id' })
  @ApiParam({ name: 'id', description: 'Continent numeric id', example: 1 })
  @ApiBody({ type: UpdateContinentDto })
  @ApiResponse({ status: 200, description: 'Continent updated', type: Continent })
  @ApiResponse({ status: 400, description: 'Validation failed or id is not a number' })
  @ApiResponse({ status: 404, description: 'Continent not found' })
  @ApiResponse({ status: 409, description: 'Continent name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContinentDto,
  ): Promise<Continent> {
    return this.continentService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '[v2] Replace a continent by id (all fields required)' })
  @ApiParam({ name: 'id', description: 'Continent numeric id', example: 1 })
  @ApiBody({ type: CreateContinentDto })
  @ApiResponse({ status: 200, description: 'Continent replaced', type: Continent })
  @ApiResponse({ status: 400, description: 'Validation failed or id is not a number' })
  @ApiResponse({ status: 404, description: 'Continent not found' })
  @ApiResponse({ status: 409, description: 'Continent name already exists' })
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContinentDto,
  ): Promise<Continent> {
    return this.continentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[v2] Delete a continent by id' })
  @ApiParam({ name: 'id', description: 'Continent numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'Continent deleted' })
  @ApiResponse({ status: 400, description: 'id is not a number' })
  @ApiResponse({ status: 404, description: 'Continent not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.continentService.remove(id);
  }
}
