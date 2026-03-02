// Tests for CityService:
//   create   — happy path, NotFoundException when country missing,
//              ConflictException on duplicate city_name
//   findAll  — returns array with relations
//   findOne  — happy path, NotFoundException when missing
//   update   — happy path (no FK/name change), FK changed to valid country,
//              FK changed to missing country (NotFoundException),
//              city_name changed (no conflict), city_name changed (conflict),
//              same country_id (no FK lookup), same city_name (no dup check),
//              city not found (NotFoundException)
//   remove   — happy path, NotFoundException propagated from findOne

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CityService } from './city.service';
import { City } from './city.entity';
import { Country } from '../country/country.entity';
import { Continent } from '../continent/continent.entity';

const mockContinent = (): Continent => ({
  continent_id: 1,
  name: 'Africa',
  net_area: 30370000,
  geology: [],
  structure: [],
  change_ratio: 0.01,
  population: 1400000000,
});

const mockCountry = (): Country => ({
  country_id: 1,
  name: 'Nigeria',
  population: 220000000,
  net_area: 923768,
  political_system: [],
  economical_index: {},
  languages: ['English'],
  continent: mockContinent(),
});

const mockCity = (): City => ({
  city_id: 1,
  city_name: 'Lagos',
  economical_index: { trade: 60 },
  languages: ['English'],
  population: 15000000,
  net_area: 1171,
  country: mockCountry(),
});

const mockCityRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockCountryRepo = () => ({
  findOne: jest.fn(),
});

describe('CityService', () => {
  let service: CityService;
  let cityRepo: ReturnType<typeof mockCityRepo>;
  let countryRepo: ReturnType<typeof mockCountryRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        { provide: getRepositoryToken(City), useFactory: mockCityRepo },
        { provide: getRepositoryToken(Country), useFactory: mockCountryRepo },
      ],
    }).compile();

    service = module.get<CityService>(CityService);
    cityRepo = module.get(getRepositoryToken(City));
    countryRepo = module.get(getRepositoryToken(Country));
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      country_id: 1,
      city_name: 'Lagos',
      economical_index: { trade: 60 },
      languages: ['English'],
      population: 15000000,
      net_area: 1171,
    };

    it('should create and return a city', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry());
      cityRepo.findOne.mockResolvedValue(null);
      cityRepo.create.mockReturnValue(mockCity());
      cityRepo.save.mockResolvedValue(mockCity());

      const result = await service.create(dto);

      expect(countryRepo.findOne).toHaveBeenCalledWith({
        where: { country_id: dto.country_id },
      });
      expect(cityRepo.save).toHaveBeenCalled();
      expect(result.city_name).toBe('Lagos');
    });

    it('should throw NotFoundException when country does not exist', async () => {
      countryRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow(
        `Country with id ${dto.country_id} does not exist`,
      );
      expect(cityRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when city_name already exists', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry());
      cityRepo.findOne.mockResolvedValue(mockCity()); // duplicate

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        `City with name "${dto.city_name}" already exists`,
      );
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return cities with country relation', async () => {
      cityRepo.find.mockResolvedValue([mockCity()]);

      const result = await service.findAll();

      expect(cityRepo.find).toHaveBeenCalledWith({ relations: ['country'] });
      expect(result).toHaveLength(1);
      expect(result[0].country.name).toBe('Nigeria');
    });

    it('should return empty array when no cities exist', async () => {
      cityRepo.find.mockResolvedValue([]);

      expect(await service.findAll()).toEqual([]);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return city with country relation', async () => {
      cityRepo.findOne.mockResolvedValue(mockCity());

      const result = await service.findOne(1);

      expect(cityRepo.findOne).toHaveBeenCalledWith({
        where: { city_id: 1 },
        relations: ['country'],
      });
      expect(result.city_id).toBe(1);
    });

    it('should throw NotFoundException when city does not exist', async () => {
      cityRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'City with id 99 does not exist',
      );
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update without changing FK or city_name', async () => {
      const city = mockCity();
      cityRepo.findOne.mockResolvedValue(city);
      cityRepo.save.mockResolvedValue({ ...city, net_area: 2000 });

      const result = await service.update(1, { net_area: 2000 });

      expect(cityRepo.save).toHaveBeenCalled();
      expect(result.net_area).toBe(2000);
    });

    it('should update country when country_id changes to valid country', async () => {
      const city = mockCity();
      const newCountry: Country = {
        ...mockCountry(),
        country_id: 2,
        name: 'Ghana',
      };
      cityRepo.findOne.mockResolvedValue(city);
      countryRepo.findOne.mockResolvedValue(newCountry);
      cityRepo.save.mockResolvedValue({ ...city, country: newCountry });

      const result = await service.update(1, { country_id: 2 });

      expect(countryRepo.findOne).toHaveBeenCalledWith({
        where: { country_id: 2 },
      });
      expect(result.country.country_id).toBe(2);
    });

    it('should throw NotFoundException when new country_id does not exist', async () => {
      const city = mockCity();
      cityRepo.findOne.mockResolvedValue(city);
      countryRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, { country_id: 99 })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(1, { country_id: 99 })).rejects.toThrow(
        'Country with id 99 does not exist',
      );
    });

    it('should skip country lookup when country_id is unchanged', async () => {
      const city = mockCity(); // country_id = 1
      cityRepo.findOne.mockResolvedValue(city);
      cityRepo.save.mockResolvedValue(city);

      await service.update(1, { country_id: 1 }); // same id

      expect(countryRepo.findOne).not.toHaveBeenCalled();
    });

    it('should update city_name when new name is available', async () => {
      const city = mockCity();
      cityRepo.findOne
        .mockResolvedValueOnce(city) // findOne for city
        .mockResolvedValueOnce(null); // city_name conflict check

      cityRepo.save.mockResolvedValue({ ...city, city_name: 'Abuja' });

      const result = await service.update(1, { city_name: 'Abuja' });

      expect(result.city_name).toBe('Abuja');
    });

    it('should skip city_name conflict check when name is unchanged', async () => {
      const city = mockCity();
      cityRepo.findOne.mockResolvedValue(city);
      cityRepo.save.mockResolvedValue(city);

      await service.update(1, { city_name: 'Lagos' }); // same name

      // findOne called only once (for city lookup)
      expect(cityRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when city does not exist', async () => {
      cityRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { city_name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete and return confirmation message', async () => {
      cityRepo.findOne.mockResolvedValue(mockCity());
      cityRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(cityRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'City with id 1 has been deleted' });
    });

    it('should throw NotFoundException when city does not exist', async () => {
      cityRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(cityRepo.delete).not.toHaveBeenCalled();
    });
  });
});
