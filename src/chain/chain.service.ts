import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ContinentService } from '../continent/continent.service';
import { CountryService } from '../country/country.service';
import { CityService } from '../city/city.service';
import { ChainResult } from './chain-result.entity';
import { ChainEvent } from './chain-event.entity';

@Injectable()
export class ChainService {
  constructor(
    @InjectRepository(ChainResult)
    private readonly chainResultRepository: Repository<ChainResult>,
    @InjectRepository(ChainEvent)
    private readonly chainEventRepository: Repository<ChainEvent>,
    private readonly continentService: ContinentService,
    private readonly countryService: CountryService,
    private readonly cityService: CityService,
  ) {}

  private extractApiName(url: string): string {
    try {
      const host = new URL(url).hostname;
      if (host.includes('helpdesk-api')) return 'helpdesk-api';
      if (host.includes('13.59.49.180')) return 'futbol-api';
      return host;
    } catch {
      return url;
    }
  }

  async process(payload: Record<string, any>): Promise<Record<string, any>> {
    const meta = (payload.meta ?? {}) as Record<string, unknown>;
    const traceId = `trace-${randomUUID()}`;

    const event = await this.chainEventRepository.save(
      this.chainEventRepository.create({
        trace_id: traceId,
        direccion: 'entrada',
        estado: 'pendiente',
        sistema_origen: (meta.origen as string) ?? null,
        sistema_destino: 'api-geografia',
        endpoint: '/api/v2/chain',
        metodo: 'POST',
        status_code: null,
        request_json: payload,
        response_json: null,
        error: null,
      }),
    );

    try {
      const [continents, countries, cities] = await Promise.all([
        this.continentService.findAll(),
        this.countryService.findAll(),
        this.cityService.findAll(),
      ]);

      const continent = payload.continent_id
        ? await this.continentService.findOne(Number(payload.continent_id))
        : (continents[0] ?? null);

      const country = payload.country_id
        ? await this.countryService.findOne(Number(payload.country_id))
        : (countries[0] ?? null);

      const city = payload.city_id
        ? await this.cityService.findOne(Number(payload.city_id))
        : (cities[0] ?? null);

      const enriched: Record<string, any> = {
        ...payload,
        trace_id: traceId,
        payload: {
          ...((payload.payload as Record<string, unknown>) ?? {}),
          geografia: { continent, country, city },
        },
        meta: {
          antes: (meta.origen as string) ?? null,
          origen: 'api-geografia',
          siguiente: (meta.siguiente as string) ?? null,
        },
      };

      const siguiente: string | null = (meta.siguiente as string) ?? null;

      if (!siguiente) {
        await this.chainResultRepository.save({
          origen: (meta.origen as string) ?? null,
          result: enriched,
        });
        event.estado = 'exitoso';
        event.status_code = 201;
        event.response_json = enriched;
        await this.chainEventRepository.save(event);
        return enriched;
      }

      const outboundEvent = await this.chainEventRepository.save(
        this.chainEventRepository.create({
          trace_id: traceId,
          direccion: 'salida',
          estado: 'pendiente',
          sistema_origen: 'api-geografia',
          sistema_destino: this.extractApiName(siguiente),
          endpoint: siguiente,
          metodo: 'POST',
          status_code: null,
          request_json: enriched,
          response_json: null,
          error: null,
        }),
      );

      const forwardHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (siguiente.includes('helpdesk-api-702693621768')) {
        forwardHeaders['X-Integration-Token'] =
          'Nr3BavebHt78rRuYqmxEeH5HGulTGNM-8vjfI5Vd6rRkIP6XPWPKb6WWQbBSinuj';
      }
      const response = await fetch(siguiente, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify(enriched),
      });

      if (!response.ok) {
        const errMsg = `Next API at ${siguiente} responded with status ${response.status}`;
        outboundEvent.estado = 'fallido';
        outboundEvent.status_code = response.status;
        outboundEvent.error = errMsg;
        await this.chainEventRepository.save(outboundEvent);
        event.estado = 'fallido';
        event.error = errMsg;
        await this.chainEventRepository.save(event);
        throw new BadGatewayException(errMsg);
      }

      const responseBody = (await response.json()) as Record<string, any>;
      outboundEvent.estado = 'exitoso';
      outboundEvent.status_code = response.status;
      outboundEvent.response_json = responseBody;
      await this.chainEventRepository.save(outboundEvent);

      event.estado = 'exitoso';
      event.status_code = 200;
      event.response_json = responseBody;
      await this.chainEventRepository.save(event);

      return responseBody;
    } catch (err) {
      if (!(err instanceof BadGatewayException)) {
        event.estado = 'fallido';
        event.error = (err as Error).message;
        await this.chainEventRepository.save(event);
        throw new BadGatewayException(
          `Failed to reach next API at ${String(meta.siguiente)}: ${(err as Error).message}`,
        );
      }
      throw err;
    }
  }

  findAll(): Promise<ChainResult[]> {
    return this.chainResultRepository.find({ order: { received_at: 'DESC' } });
  }

  findOne(id: number): Promise<ChainResult | null> {
    return this.chainResultRepository.findOne({ where: { id } });
  }

  findAllEvents(): Promise<ChainEvent[]> {
    return this.chainEventRepository.find({ order: { created_at: 'DESC' } });
  }

  findEventsByTraceId(trace_id: string): Promise<ChainEvent[]> {
    return this.chainEventRepository.find({
      where: { trace_id },
      order: { created_at: 'ASC' },
    });
  }

  async updateEvent(
    trace_id: string,
    updates: Partial<
      Pick<ChainEvent, 'estado' | 'error' | 'response_json' | 'status_code'>
    >,
  ): Promise<ChainEvent[]> {
    const events = await this.chainEventRepository.find({
      where: { trace_id },
    });
    if (!events.length) return [];
    for (const ev of events) {
      Object.assign(ev, updates);
    }
    return this.chainEventRepository.save(events);
  }
}
