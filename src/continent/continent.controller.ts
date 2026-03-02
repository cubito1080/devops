import {
  Controller,
  Get,
  Post,
  Put,
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

@ApiTags('Continents')
@Controller('continents')
export class ContinentController {
  constructor(private readonly continentService: ContinentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a continent' })
  @ApiBody({ type: CreateContinentDto })
  @ApiResponse({ status: 201, description: 'Continent created', type: Continent })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Continent name already exists' })
  create(@Body() dto: CreateContinentDto): Promise<Continent> {
    return this.continentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all continents' })
  @ApiResponse({ status: 200, description: 'List of all continents', type: [Continent] })
  findAll(): Promise<Continent[]> {
    return this.continentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a continent by id' })
  @ApiParam({ name: 'id', description: 'Continent numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'Continent found', type: Continent })
  @ApiResponse({ status: 400, description: 'id is not a number' })
  @ApiResponse({ status: 404, description: 'Continent not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Continent> {
    return this.continentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a continent by id' })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a continent by id' })
  @ApiParam({ name: 'id', description: 'Continent numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'Continent deleted' })
  @ApiResponse({ status: 400, description: 'id is not a number' })
  @ApiResponse({ status: 404, description: 'Continent not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.continentService.remove(id);
  }
}

  @Post()
  create(@Body() dto: CreateContinentDto): Promise<Continent> {
    return this.continentService.create(dto);
  }

  @Get()
  findAll(): Promise<Continent[]> {
    return this.continentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Continent> {
    return this.continentService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContinentDto,
  ): Promise<Continent> {
    return this.continentService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.continentService.remove(id);
  }
}
