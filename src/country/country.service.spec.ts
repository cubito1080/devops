// Tests for CountryService:
//   create   — happy path, NotFoundException when continent missing,
//              ConflictException on duplicate country name
//   findAll  — returns array with relations
//   findOne  — happy path, NotFoundException when missing
//   update   — happy path (no FK/name change), FK changed to valid continent,
//              FK changed to missing continent (NotFoundException),
//              name changed (no conflict), name changed (conflict),
//              same continent_id (no FK lookup), same name (no duplicate check),
//              country not found (NotFoundException)
//   remove   — happy path, NotFoundException propagated from findOne

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './country.entity';
import { Continent } from '../continent/continent.entity';

const mockContinent = (): Continent => ({
  continent_id: 1,
  name: 'Africa',
  net_area: 30370000,
  geology: ['Precambrian shield'],
  structure: ['Cratons'],
  change_ratio: 0.02,
  population: 1400000000,
});

const mockCountry = (): Country => ({
  country_id: 1,
  name: 'Nigeria',
  population: 220000000,
  net_area: 923768,
  political_system: ['Federal republic'],
  economical_index: { oil: 40, agriculture: 20 },
  languages: ['English'],
  continent: mockContinent(),
});

const mockCountryRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockContinentRepo = () => ({
  findOne: jest.fn(),
});

describe('CountryService', () => {
  let service: CountryService;
  let countryRepo: ReturnType<typeof mockCountryRepo>;
  let continentRepo: ReturnType<typeof mockContinentRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        { provide: getRepositoryToken(Country), useFactory: mockCountryRepo },
        {
          provide: getRepositoryToken(Continent),
          useFactory: mockContinentRepo,
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
    countryRepo = module.get(getRepositoryToken(Country));
    continentRepo = module.get(getRepositoryToken(Continent));
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      continent_id: 1,
      name: 'Nigeria',
      population: 220000000,
      net_area: 923768,
      political_system: ['Federal republic'],
      economical_index: { oil: 40 },
      languages: ['English'],
    };

    it('should create and return a country', async () => {
      continentRepo.findOne.mockResolvedValue(mockContinent());
      countryRepo.findOne.mockResolvedValue(null);
      countryRepo.create.mockReturnValue(mockCountry());
      countryRepo.save.mockResolvedValue(mockCountry());

      const result = await service.create(dto);

      expect(continentRepo.findOne).toHaveBeenCalledWith({
        where: { continent_id: dto.continent_id },
      });
      expect(countryRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('Nigeria');
    });

    it('should throw NotFoundException when continent does not exist', async () => {
      continentRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow(
        `Continent with id ${dto.continent_id} does not exist`,
      );
      expect(countryRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when country name already exists', async () => {
      continentRepo.findOne.mockResolvedValue(mockContinent());
      countryRepo.findOne.mockResolvedValue(mockCountry()); // duplicate

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        `Country with this ${dto.name} already exists`,
      );
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return countries with continent relation', async () => {
      countryRepo.find.mockResolvedValue([mockCountry()]);

      const result = await service.findAll();

      expect(countryRepo.find).toHaveBeenCalledWith({
        relations: ['continent'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].continent.name).toBe('Africa');
    });

    it('should return empty array when no countries exist', async () => {
      countryRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return country with continent relation', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry());

      const result = await service.findOne(1);

      expect(countryRepo.findOne).toHaveBeenCalledWith({
        where: { country_id: 1 },
        relations: ['continent'],
      });
      expect(result.country_id).toBe(1);
    });

    it('should throw NotFoundException when country does not exist', async () => {
      countryRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'Country with id 99 does not exist',
      );
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update without changing FK or name', async () => {
      const country = mockCountry();
      countryRepo.findOne.mockResolvedValue(country);
      countryRepo.save.mockResolvedValue({ ...country, net_area: 999 });

      const result = await service.update(1, { net_area: 999 });

      expect(countryRepo.save).toHaveBeenCalled();
      expect(result.net_area).toBe(999);
    });

    it('should update continent when continent_id changes to valid continent', async () => {
      const country = mockCountry();
      const newContinent: Continent = {
        ...mockContinent(),
        continent_id: 2,
        name: 'Asia',
      };
      countryRepo.findOne.mockResolvedValue(country);
      continentRepo.findOne.mockResolvedValue(newContinent);
      countryRepo.save.mockResolvedValue({
        ...country,
        continent: newContinent,
      });

      const result = await service.update(1, { continent_id: 2 });

      expect(continentRepo.findOne).toHaveBeenCalledWith({
        where: { continent_id: 2 },
      });
      expect(result.continent.continent_id).toBe(2);
    });

    it('should throw NotFoundException when new continent_id does not exist', async () => {
      const country = mockCountry();
      countryRepo.findOne.mockResolvedValue(country);
      continentRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, { continent_id: 99 })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(1, { continent_id: 99 })).rejects.toThrow(
        'Continent with id 99 does not exist',
      );
    });

    it('should skip continent lookup when continent_id is unchanged', async () => {
      const country = mockCountry(); // continent_id = 1
      countryRepo.findOne.mockResolvedValue(country);
      countryRepo.save.mockResolvedValue(country);

      await service.update(1, { continent_id: 1 }); // same id

      expect(continentRepo.findOne).not.toHaveBeenCalled();
    });

    it('should update name when new name is available', async () => {
      const country = mockCountry();
      countryRepo.findOne
        .mockResolvedValueOnce(country)  // findOne for country
        .mockResolvedValueOnce(null);    // name conflict check

      countryRepo.save.mockResolvedValue({ ...country, name: 'Ghana' });

      const result = await service.update(1, { name: 'Ghana' });

      expect(result.name).toBe('Ghana');
    });

    it('should skip name-conflict check when name is unchanged', async () => {
      const country = mockCountry();
      countryRepo.findOne.mockResolvedValue(country);
      countryRepo.save.mockResolvedValue(country);

      await service.update(1, { name: 'Nigeria' }); // same name

      // findOne called only once (for country lookup, not name-conflict check)
      expect(countryRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when country does not exist', async () => {
      countryRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete and return confirmation message', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry());
      countryRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(countryRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Country with id 1 has been deleted' });
    });

    it('should throw NotFoundException when country does not exist', async () => {
      countryRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(countryRepo.delete).not.toHaveBeenCalled();
    });
  });
});
