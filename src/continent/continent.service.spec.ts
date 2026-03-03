// Tests for ContinentService:
//   create        — happy path, ConflictException on duplicate name
//   findAll       — returns array, returns empty array
//   findOne       — happy path, NotFoundException when missing
//   update        — happy path (same name), name changed (no conflict),
//                   name changed (conflict), NotFoundException when missing
//   remove        — happy path, NotFoundException propagated from findOne

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
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

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ContinentService', () => {
  let service: ContinentService;
  let repo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContinentService,
        { provide: getRepositoryToken(Continent), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<ContinentService>(ContinentService);
    repo = module.get(getRepositoryToken(Continent));
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

    it('should create and return a continent', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockContinent());
      repo.save.mockResolvedValue(mockContinent());

      const result = await service.create(dto);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { name: dto.name } });
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result.name).toBe('Africa');
    });

    it('should throw ConflictException when name already exists', async () => {
      repo.findOne.mockResolvedValue(mockContinent());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        `Continent with this ${dto.name} already exists`,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return an array of continents', async () => {
      const list = [
        mockContinent(),
        { ...mockContinent(), continent_id: 2, name: 'Asia' },
      ];
      repo.find.mockResolvedValue(list);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no continents exist', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return the continent when found', async () => {
      repo.findOne.mockResolvedValue(mockContinent());

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { continent_id: 1 } });
      expect(result.continent_id).toBe(1);
    });

    it('should throw NotFoundException when continent does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'Continent with id 99 does not exist',
      );
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return continent when no name change', async () => {
      const continent = mockContinent();
      repo.findOne.mockResolvedValue(continent);
      repo.save.mockResolvedValue({ ...continent, net_area: 999 });

      const result = await service.update(1, { net_area: 999 });

      expect(repo.save).toHaveBeenCalled();
      expect(result.net_area).toBe(999);
    });

    it('should update when name changes and new name is available', async () => {
      const continent = mockContinent();
      // first findOne for existence check, second for name-conflict check
      repo.findOne
        .mockResolvedValueOnce(continent) // existence check
        .mockResolvedValueOnce(null); // name conflict check → no conflict

      repo.save.mockResolvedValue({ ...continent, name: 'Eurasia' });

      const result = await service.update(1, { name: 'Eurasia' });

      expect(result.name).toBe('Eurasia');
    });

    it('should throw ConflictException when new name is already taken', async () => {
      const continent = mockContinent();
      const conflicting = {
        ...mockContinent(),
        continent_id: 2,
        name: 'Eurasia',
      };

      repo.findOne
        .mockResolvedValueOnce(continent) // existence check
        .mockResolvedValueOnce(conflicting); // name conflict check → conflict

      await expect(service.update(1, { name: 'Eurasia' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when continent does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should skip name-conflict check when name is unchanged', async () => {
      const continent = mockContinent();
      repo.findOne.mockResolvedValue(continent);
      repo.save.mockResolvedValue(continent);

      await service.update(1, { name: 'Africa' }); // same name

      // findOne called once (existence) — NOT twice (no conflict check)
      expect(repo.findOne).toHaveBeenCalledTimes(1);
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete and return a confirmation message', async () => {
      repo.findOne.mockResolvedValue(mockContinent());
      repo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Continent with id 1 has been deleted',
      });
    });

    it('should throw NotFoundException when continent does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
