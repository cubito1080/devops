import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  NotFoundException,
} from '@nestjs/common';
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
      'returns the final accumulated result to the caller. Logs a ChainEvent for traceability.',
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

  // ── ChainResult endpoints ────────────────────────────────────────────────

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

  // ── ChainEvent (traceability) endpoints ─────────────────────────────────

  @Get('events/all')
  @ApiOperation({ summary: '[v2] Get all chain events (traceability log)' })
  @ApiResponse({ status: 200, description: 'List of all chain events, newest first' })
  findAllEvents() {
    return this.chainService.findAllEvents();
  }

  @Get('events/:trace_id')
  @ApiOperation({ summary: '[v2] Get all events for a specific trace_id' })
  @ApiParam({
    name: 'trace_id',
    description: 'trace-{uuid} string returned in the chain response',
    example: 'trace-04eda815-7e71-46c6-986e-6a34f4459e0e',
  })
  @ApiResponse({ status: 200, description: 'All events (entrada + salida) for the trace' })
  @ApiResponse({ status: 404, description: 'No events found for this trace_id' })
  async findEventsByTrace(@Param('trace_id') trace_id: string) {
    const events = await this.chainService.findEventsByTraceId(trace_id);
    if (!events.length) throw new NotFoundException(`No events found for trace_id ${trace_id}`);
    return { count: events.length, trace_id, results: events };
  }

  @Patch('events/:trace_id')
  @ApiOperation({ summary: '[v2] Update estado/error/response for all events of a trace_id' })
  @ApiParam({ name: 'trace_id', example: 'trace-04eda815-7e71-46c6-986e-6a34f4459e0e' })
  @ApiBody({
    schema: {
      example: {
        estado: 'exitoso',
        status_code: 200,
        error: null,
        response_json: {},
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated events returned' })
  @ApiResponse({ status: 404, description: 'No events found for this trace_id' })
  async updateEvent(
    @Param('trace_id') trace_id: string,
    @Body() body: { estado?: string; error?: string; response_json?: Record<string, any>; status_code?: number },
  ) {
    const updated = await this.chainService.updateEvent(trace_id, body);
    if (!updated.length) throw new NotFoundException(`No events found for trace_id ${trace_id}`);
    return { count: updated.length, trace_id, results: updated };
  }
}
