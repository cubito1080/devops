// Tests for CountryController:
//   create   — delegates to service.create, propagates ConflictException,
//              propagates NotFoundException (continent missing)
//   findAll  — delegates to service.findAll
//   findOne  — delegates to service.findOne, propagates NotFoundException
//   update   — delegates to service.update, propagates NotFoundException
//              and ConflictException
//   remove   — delegates to service.remove, propagates NotFoundException

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CountryController } from './country.controller';
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
  economical_index: { oil: 40 },
  languages: ['English'],
  continent: mockContinent(),
});

const mockCountryService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CountryController', () => {
  let controller: CountryController;
  let service: ReturnType<typeof mockCountryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryController],
      providers: [{ provide: CountryService, useFactory: mockCountryService }],
    }).compile();

    controller = module.get<CountryController>(CountryController);
    service = module.get(CountryService);
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

    it('should call service.create and return the new country', async () => {
      service.create.mockResolvedValue(mockCountry());

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.name).toBe('Nigeria');
    });

    it('should propagate NotFoundException when continent is missing', async () => {
      service.create.mockRejectedValue(
        new NotFoundException('Continent with id 1 does not exist'),
      );

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should propagate ConflictException on duplicate name', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Country with this Nigeria already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return list of countries', async () => {
      service.findAll.mockResolvedValue([mockCountry()]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no countries', async () => {
      service.findAll.mockResolvedValue([]);

      expect(await controller.findAll()).toEqual([]);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call service.findOne and return the country', async () => {
      service.findOne.mockResolvedValue(mockCountry());

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result.country_id).toBe(1);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Country with id 99 does not exist'),
      );

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call service.update and return the updated country', async () => {
      const updated = { ...mockCountry(), net_area: 999 };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, { net_area: 999 });

      expect(service.update).toHaveBeenCalledWith(1, { net_area: 999 });
      expect(result.net_area).toBe(999);
    });

    it('should propagate NotFoundException from service', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Country with id 99 does not exist'),
      );

      await expect(controller.update(99, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate ConflictException from service', async () => {
      service.update.mockRejectedValue(
        new ConflictException('Country with this Ghana already exists'),
      );

      await expect(controller.update(1, { name: 'Ghana' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call service.remove and return confirmation message', async () => {
      service.remove.mockResolvedValue({
        message: 'Country with id 1 has been deleted',
      });

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result.message).toContain('1');
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Country with id 99 does not exist'),
      );

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
