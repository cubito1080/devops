import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { Continent } from './continent/continent.entity';
import { Country } from './country/country.entity';
import { City } from './city/city.entity';

// ─── Connection ────────────────────────────────────────────────────────────────

const AppDataSource = process.env.DATABASE_URL
  ? new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Continent, Country, City],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    })
  : new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'jero',
      password: '123',
      database: 'geography_db',
      entities: [Continent, Country, City],
      synchronize: true,
    });

// ─── Seed data ─────────────────────────────────────────────────────────────────

const SEED = [
  {
    continent: {
      name: 'Europe',
      net_area: 10_530_000,
      geology: [
        'Precambrian shields',
        'Paleozoic fold belts',
        'Alpine orogeny',
      ],
      structure: [
        'Baltic Shield',
        'East European Platform',
        'Hercynian massifs',
      ],
      change_ratio: 0.01,
      population: 447_000_000,
    },
    countries: [
      {
        name: 'France',
        population: 68_000_000,
        net_area: 551_695,
        political_system: ['Unitary semi-presidential republic'],
        economical_index: { gdp_trillion_usd: 2.78, gini: 31.5 },
        languages: ['French'],
        capital: {
          city_name: 'Paris',
          population: 2_161_000,
          net_area: 105,
          economical_index: { gdp_billion_usd: 709.0 },
          languages: ['French'],
        },
      },
      {
        name: 'Germany',
        population: 84_000_000,
        net_area: 357_114,
        political_system: ['Federal parliamentary republic'],
        economical_index: { gdp_trillion_usd: 4.07, gini: 31.7 },
        languages: ['German'],
        capital: {
          city_name: 'Berlin',
          population: 3_677_000,
          net_area: 892,
          economical_index: { gdp_billion_usd: 147.0 },
          languages: ['German'],
        },
      },
      {
        name: 'Spain',
        population: 47_400_000,
        net_area: 505_990,
        political_system: ['Unitary parliamentary constitutional monarchy'],
        economical_index: { gdp_trillion_usd: 1.42, gini: 34.3 },
        languages: ['Spanish', 'Catalan', 'Galician', 'Basque'],
        capital: {
          city_name: 'Madrid',
          population: 3_305_000,
          net_area: 604,
          economical_index: { gdp_billion_usd: 240.0 },
          languages: ['Spanish'],
        },
      },
      {
        name: 'Italy',
        population: 58_800_000,
        net_area: 301_340,
        political_system: ['Unitary parliamentary republic'],
        economical_index: { gdp_trillion_usd: 2.05, gini: 35.9 },
        languages: ['Italian'],
        capital: {
          city_name: 'Rome',
          population: 2_873_000,
          net_area: 1285,
          economical_index: { gdp_billion_usd: 93.0 },
          languages: ['Italian'],
        },
      },
    ],
  },
  {
    continent: {
      name: 'Americas',
      net_area: 42_549_000,
      geology: [
        'Canadian Shield',
        'Appalachian fold belt',
        'Andean orogeny',
        'Amazon basin sediments',
      ],
      structure: [
        'North American Craton',
        'South American Plate',
        'Caribbean Plate',
      ],
      change_ratio: 0.015,
      population: 1_009_000_000,
    },
    countries: [
      {
        name: 'United States',
        population: 335_000_000,
        net_area: 9_833_517,
        political_system: ['Federal presidential constitutional republic'],
        economical_index: { gdp_trillion_usd: 25.46, gini: 41.5 },
        languages: ['English'],
        capital: {
          city_name: 'Washington D.C.',
          population: 689_545,
          net_area: 177,
          economical_index: { gdp_billion_usd: 160.0 },
          languages: ['English'],
        },
      },
      {
        name: 'Brazil',
        population: 215_000_000,
        net_area: 8_515_767,
        political_system: ['Federal presidential constitutional republic'],
        economical_index: { gdp_trillion_usd: 1.92, gini: 52.9 },
        languages: ['Portuguese'],
        capital: {
          city_name: 'Brasilia',
          population: 3_094_000,
          net_area: 5802,
          economical_index: { gdp_billion_usd: 55.0 },
          languages: ['Portuguese'],
        },
      },
      {
        name: 'Canada',
        population: 38_000_000,
        net_area: 9_984_670,
        political_system: ['Federal parliamentary constitutional monarchy'],
        economical_index: { gdp_trillion_usd: 2.14, gini: 33.3 },
        languages: ['English', 'French'],
        capital: {
          city_name: 'Ottawa',
          population: 1_017_000,
          net_area: 2796,
          economical_index: { gdp_billion_usd: 60.0 },
          languages: ['English', 'French'],
        },
      },
      {
        name: 'Mexico',
        population: 128_000_000,
        net_area: 1_964_375,
        political_system: ['Federal presidential constitutional republic'],
        economical_index: { gdp_trillion_usd: 1.32, gini: 45.4 },
        languages: ['Spanish'],
        capital: {
          city_name: 'Mexico City',
          population: 9_209_000,
          net_area: 1485,
          economical_index: { gdp_billion_usd: 411.0 },
          languages: ['Spanish'],
        },
      },
    ],
  },
  {
    continent: {
      name: 'Asia',
      net_area: 44_579_000,
      geology: [
        'Siberian Craton',
        'Himalayan orogeny',
        'Arabian shield',
        'Tethys sedimentary belt',
      ],
      structure: [
        'Eurasian Plate',
        'Indian Plate',
        'Pacific Plate margin',
        'Arabian Plate',
      ],
      change_ratio: 0.02,
      population: 4_700_000_000,
    },
    countries: [
      {
        name: 'China',
        population: 1_400_000_000,
        net_area: 9_596_960,
        political_system: [
          'Unitary Marxist-Leninist one-party socialist republic',
        ],
        economical_index: { gdp_trillion_usd: 17.96, gini: 38.2 },
        languages: ['Mandarin Chinese'],
        capital: {
          city_name: 'Beijing',
          population: 21_893_000,
          net_area: 16_411,
          economical_index: { gdp_billion_usd: 522.0 },
          languages: ['Mandarin Chinese'],
        },
      },
      {
        name: 'Japan',
        population: 125_000_000,
        net_area: 377_975,
        political_system: ['Unitary parliamentary constitutional monarchy'],
        economical_index: { gdp_trillion_usd: 4.23, gini: 32.9 },
        languages: ['Japanese'],
        capital: {
          city_name: 'Tokyo',
          population: 13_960_000,
          net_area: 2194,
          economical_index: { gdp_billion_usd: 1100.0 },
          languages: ['Japanese'],
        },
      },
      {
        name: 'India',
        population: 1_428_000_000,
        net_area: 3_287_263,
        political_system: ['Federal parliamentary constitutional republic'],
        economical_index: { gdp_trillion_usd: 3.39, gini: 35.7 },
        languages: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi'],
        capital: {
          city_name: 'New Delhi',
          population: 32_941_000,
          net_area: 1484,
          economical_index: { gdp_billion_usd: 293.6 },
          languages: ['Hindi', 'English'],
        },
      },
      {
        name: 'Russia',
        population: 144_000_000,
        net_area: 17_098_242,
        political_system: ['Federal semi-presidential constitutional republic'],
        economical_index: { gdp_trillion_usd: 2.24, gini: 37.5 },
        languages: ['Russian'],
        capital: {
          city_name: 'Moscow',
          population: 12_506_000,
          net_area: 2561,
          economical_index: { gdp_billion_usd: 520.0 },
          languages: ['Russian'],
        },
      },
    ],
  },
];

// ─── Runner ────────────────────────────────────────────────────────────────────

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  // Clean up existing data (order matters: child tables first due to FK)
  await AppDataSource.query('DELETE FROM city');
  await AppDataSource.query('DELETE FROM country');
  await AppDataSource.query('DELETE FROM continent');
  console.log('Existing data cleared');

  const continentRepo = AppDataSource.getRepository(Continent);
  const countryRepo = AppDataSource.getRepository(Country);
  const cityRepo = AppDataSource.getRepository(City);

  for (const entry of SEED) {
    // 1. Save continent
    const continent = continentRepo.create(entry.continent);
    const savedContinent = await continentRepo.save(continent);
    console.log(`  ✔ Continent: ${savedContinent.name}`);

    for (const countryData of entry.countries) {
      const { capital, ...countryFields } = countryData;

      // 2. Save country linked to the continent
      const country = countryRepo.create({
        ...countryFields,
        continent: savedContinent,
      });
      const savedCountry = await countryRepo.save(country);
      console.log(`      ✔ Country: ${savedCountry.name}`);

      // 3. Save capital city linked to the country
      const city = cityRepo.create({
        ...capital,
        country: savedCountry,
      });
      const savedCity = await cityRepo.save(city);
      console.log(`          ✔ Capital: ${savedCity.city_name}`);
    }
  }

  await AppDataSource.destroy();
  console.log('\nSeed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
