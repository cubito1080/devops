import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
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
}
