import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContinentService } from '../continent/continent.service';
import { CountryService } from '../country/country.service';
import { CityService } from '../city/city.service';
import { ChainResult } from './chain-result.entity';

@Injectable()
export class ChainService {
  constructor(
    @InjectRepository(ChainResult)
    private readonly chainResultRepository: Repository<ChainResult>,
    private readonly continentService: ContinentService,
    private readonly countryService: CountryService,
    private readonly cityService: CityService,
  ) {}

  async process(payload: Record<string, any>): Promise<Record<string, any>> {
    const meta = payload.meta ?? {};

    // Fetch entities: use provided IDs or fall back to first record in DB
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
      payload: {
        ...(payload.payload ?? {}),
        geografia: {
          continent,
          country,
          city,
        },
      },
      meta: {
        antes: meta.origen ?? null,
        origen: 'api-geografia',
        siguiente: meta.siguiente ?? null,
      },
    };

    const siguiente: string | null = meta.siguiente ?? null;

    if (!siguiente) {
      await this.chainResultRepository.save({
        origen: meta.origen ?? null,
        result: enriched,
      });
      return enriched;
    }

    // Forward enriched payload to the next API in the chain
    try {
      const response = await fetch(siguiente, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched),
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `Next API at ${siguiente} responded with status ${response.status}`,
        );
      }

      return response.json() as Promise<Record<string, any>>;
    } catch (err) {
      if (err instanceof BadGatewayException) throw err;
      throw new BadGatewayException(
        `Failed to reach next API at ${siguiente}: ${(err as Error).message}`,
      );
    }
  }

  findAll(): Promise<ChainResult[]> {
    return this.chainResultRepository.find({
      order: { received_at: 'DESC' },
    });
  }

  findOne(id: number): Promise<ChainResult | null> {
    return this.chainResultRepository.findOne({ where: { id } });
  }
}
