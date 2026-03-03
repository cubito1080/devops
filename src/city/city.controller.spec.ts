// Tests for CityController:
//   create   — delegates to service.create, propagates NotFoundException,
//              propagates ConflictException
//   findAll  — delegates to service.findAll
//   findOne  — delegates to service.findOne, propagates NotFoundException
//   update   — delegates to service.update, propagates NotFoundException
//              and ConflictException
//   remove   — delegates to service.remove, propagates NotFoundException

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CityController } from './city.controller';
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

const mockCityService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CityController', () => {
  let controller: CityController;
  let service: ReturnType<typeof mockCityService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [{ provide: CityService, useFactory: mockCityService }],
    }).compile();

    controller = module.get<CityController>(CityController);
    service = module.get(CityService);
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

    it('should call service.create and return the new city', async () => {
      service.create.mockResolvedValue(mockCity());

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.city_name).toBe('Lagos');
    });

    it('should propagate NotFoundException when country is missing', async () => {
      service.create.mockRejectedValue(
        new NotFoundException('Country with id 1 does not exist'),
      );

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should propagate ConflictException on duplicate city_name', async () => {
      service.create.mockRejectedValue(
        new ConflictException('City with name "Lagos" already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return list of cities', async () => {
      service.findAll.mockResolvedValue([mockCity()]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no cities exist', async () => {
      service.findAll.mockResolvedValue([]);

      expect(await controller.findAll()).toEqual([]);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call service.findOne and return the city', async () => {
      service.findOne.mockResolvedValue(mockCity());

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result.city_id).toBe(1);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('City with id 99 does not exist'),
      );

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call service.update and return the updated city', async () => {
      const updated = { ...mockCity(), net_area: 2000 };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, { net_area: 2000 });

      expect(service.update).toHaveBeenCalledWith(1, { net_area: 2000 });
      expect(result.net_area).toBe(2000);
    });

    it('should propagate NotFoundException from service', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('City with id 99 does not exist'),
      );

      await expect(controller.update(99, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate ConflictException from service', async () => {
      service.update.mockRejectedValue(
        new ConflictException('City with name "Abuja" already exists'),
      );

      await expect(
        controller.update(1, { city_name: 'Abuja' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call service.remove and return confirmation message', async () => {
      service.remove.mockResolvedValue({
        message: 'City with id 1 has been deleted',
      });

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result.message).toContain('1');
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('City with id 99 does not exist'),
      );

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
