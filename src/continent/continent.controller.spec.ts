// Tests for ContinentController:
//   create   — delegates to service.create and returns result
//   findAll  — delegates to service.findAll and returns result
//   findOne  — delegates to service.findOne with parsed id
//   update   — delegates to service.update with parsed id and dto
//   remove   — delegates to service.remove with parsed id
//
// Error propagation (NotFoundException, ConflictException) is owned by the
// service layer; controller tests verify that the service is called with the
// correct arguments and that its resolved value is passed through.

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContinentController } from './continent.controller';
import { ContinentService } from './continent.service';
import { Continent } from './continent.entity';

const mockContinent = (): Continent => ({
  continent_id: 1,
  name: 'Africa',
  net_area: 30370000,
  geology: ['Precambrian shield'],
  structure: ['Cratons'],
  change_ratio: 0.02,
  population: 1400000000,
});

const mockContinentService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ContinentController', () => {
  let controller: ContinentController;
  let service: ReturnType<typeof mockContinentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContinentController],
      providers: [
        { provide: ContinentService, useFactory: mockContinentService },
      ],
    }).compile();

    controller = module.get<ContinentController>(ContinentController);
    service = module.get(ContinentService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      name: 'Africa',
      net_area: 30370000,
      geology: ['Precambrian shield'],
      structure: ['Cratons'],
      change_ratio: 0.02,
      population: 1400000000,
    };

    it('should call service.create and return the new continent', async () => {
      service.create.mockResolvedValue(mockContinent());

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.name).toBe('Africa');
    });

    it('should propagate ConflictException from service', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Continent with this Africa already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return the list of continents from service', async () => {
      const list = [mockContinent()];
      service.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return an empty array when no continents exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call service.findOne and return the continent', async () => {
      service.findOne.mockResolvedValue(mockContinent());

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result.continent_id).toBe(1);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Continent with id 99 does not exist'),
      );

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call service.update and return the updated continent', async () => {
      const updated = { ...mockContinent(), net_area: 999 };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, { net_area: 999 });

      expect(service.update).toHaveBeenCalledWith(1, { net_area: 999 });
      expect(result.net_area).toBe(999);
    });

    it('should propagate NotFoundException from service', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Continent with id 99 does not exist'),
      );

      await expect(controller.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate ConflictException from service', async () => {
      service.update.mockRejectedValue(
        new ConflictException('Continent with this Eurasia already exists'),
      );

      await expect(controller.update(1, { name: 'Eurasia' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call service.remove and return confirmation message', async () => {
      service.remove.mockResolvedValue({
        message: 'Continent with id 1 has been deleted',
      });

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result.message).toContain('1');
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Continent with id 99 does not exist'),
      );

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
