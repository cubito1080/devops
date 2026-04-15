import { Controller, Post, Get, Param, ParseIntPipe, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ChainService } from './chain.service';

@ApiTags('Chain v2')
@Controller('api/v2/chain')
export class ChainController {
  constructor(private readonly chainService: ChainService) {}

  @Post()
  @ApiOperation({
    summary: '[v2] Process and forward a chained payload',
    description:
      'Receives a dynamic JSON payload, enriches it with a continent, country, and city record, ' +
      'updates the meta object, then forwards the enriched payload to meta.siguiente (if set) or ' +
      'returns the final accumulated result to the caller.',
  })
  @ApiBody({
    schema: {
      example: {
        meta: {
          antes: null,
          origen: 'client',
          siguiente: 'https://next-api.example.com/api/v2/chain',
        },
        continent_id: 1,
        country_id: 1,
        city_id: 1,
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Payload enriched and chain result returned' })
  @ApiResponse({ status: 502, description: 'Failed to forward payload to the next API' })
  process(@Body() payload: Record<string, any>): Promise<Record<string, any>> {
    return this.chainService.process(payload);
  }

  @Get()
  @ApiOperation({ summary: '[v2] Get all saved terminal chain results' })
  @ApiResponse({ status: 200, description: 'List of all saved chain results, newest first' })
  findAll() {
    return this.chainService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '[v2] Get a single saved chain result by id' })
  @ApiParam({ name: 'id', description: 'ChainResult numeric id', example: 1 })
  @ApiResponse({ status: 200, description: 'Chain result found' })
  @ApiResponse({ status: 404, description: 'Chain result not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.chainService.findOne(id);
    if (!result) throw new NotFoundException(`Chain result with id ${id} not found`);
    return result;
  }
}
