import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationPrismaClientService } from '../test/classes/integration-prisma-client-service.mock-provider';
import { PrismaClientService } from './external-modules/prisma-client/prisma-client.service';
import { $Enums } from '@prisma/client';

describe('IntegrationPrismaClientService', () => {
  let service: IntegrationPrismaClientService;
  let prismaClientService: PrismaClientService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegrationPrismaClientService, PrismaClientService],
    }).compile();

    service = module.get<IntegrationPrismaClientService>(
      IntegrationPrismaClientService,
    );
    prismaClientService = module.get(PrismaClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('finds (should not be mocked)', () => {
    it('should return a record directly from the db indicating live findFirst', async () => {
      const result = await service.externalSystem.findFirst({
        where: { name: $Enums.ExternalSystemName.EZ_CATER },
      });
      expect(result).toBeDefined();
      expect(result?.name).toBe('EZ_CATER');
      expect(result?.uiName).toBe('ezCater');
      expect(result?.uiDescription).toBe('Catering company');
      expect(result?.requirements).toHaveProperty('API_KEY');
      expect(result?.requirements).toHaveProperty('WEBHOOK_SECRET');
    });
    it('should return null if record not found in db indicating live findFirst', async () => {
      const result = await service.externalSystem.findFirst({
        where: { name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE },
      });
      expect(result).toBeNull();
    });
    it('should return a record directly from the db indicating live findFirstOrThrow', async () => {
      const result = await service.externalSystem.findFirst({
        where: { name: $Enums.ExternalSystemName.EZ_CATER },
      });
      expect(result).toBeDefined();
      expect(result?.name).toBe('EZ_CATER');
      expect(result?.uiName).toBe('ezCater');
      expect(result?.uiDescription).toBe('Catering company');
      expect(result?.requirements).toHaveProperty('API_KEY');
      expect(result?.requirements).toHaveProperty('WEBHOOK_SECRET');
    });
    it('should throw if record not found in db indicating live findFirstOrThrow', async () => {
      await expect(
        service.externalSystem.findFirstOrThrow({
          where: { name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE },
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          name: 'NotFoundError',
          code: 'P2025',
        }),
      );
    });
    it('should return a record directly from the db indicating live findMany', async () => {
      const result = await service.externalSystem.findMany({
        where: {
          name: {
            in: [
              $Enums.ExternalSystemName.EZ_CATER, // in db
              $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE, // not in db
            ],
          },
        },
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);

      const ezCaterRecord = result.find(
        (record) => record.name === $Enums.ExternalSystemName.EZ_CATER,
      );
      expect(ezCaterRecord).toBeDefined();
      expect(ezCaterRecord?.name).toBe($Enums.ExternalSystemName.EZ_CATER);
      expect(ezCaterRecord?.uiName).toBe('ezCater');
      expect(ezCaterRecord?.uiDescription).toBe('Catering company');
      expect(ezCaterRecord?.requirements).toHaveProperty('API_KEY');
      expect(ezCaterRecord?.requirements).toHaveProperty('WEBHOOK_SECRET');

      const testUseRecord = result.find(
        (record) =>
          record.name === $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE,
      );
      expect(testUseRecord).toBeUndefined();
    });
    it('should return a record directly from the db indicating live findUnique', async () => {
      const result = await service.externalSystem.findUnique({
        where: { name: $Enums.ExternalSystemName.EZ_CATER },
      });
      expect(result).toBeDefined();
      expect(result?.name).toBe('EZ_CATER');
      expect(result?.uiName).toBe('ezCater');
      expect(result?.uiDescription).toBe('Catering company');
      expect(result?.requirements).toHaveProperty('API_KEY');
      expect(result?.requirements).toHaveProperty('WEBHOOK_SECRET');
    });
    it('should return null if record not found in db indicating live findUnique', async () => {
      const result = await service.externalSystem.findUnique({
        where: { name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE },
      });
      expect(result).toBeNull();
    });
    it('should return a record directly from the db indicating live findUniqueOrThrow', async () => {
      const result = await service.externalSystem.findUniqueOrThrow({
        where: { name: $Enums.ExternalSystemName.EZ_CATER },
      });
      expect(result).toBeDefined();
      expect(result?.name).toBe('EZ_CATER');
      expect(result?.uiName).toBe('ezCater');
      expect(result?.uiDescription).toBe('Catering company');
      expect(result?.requirements).toHaveProperty('API_KEY');
      expect(result?.requirements).toHaveProperty('WEBHOOK_SECRET');
    });
    it('should throw if record not found in db indicating live findUniqueOrThrow', async () => {
      await expect(
        service.externalSystem.findUniqueOrThrow({
          where: { name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE },
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          name: 'NotFoundError',
          code: 'P2025',
        }),
      );
    });
  });
  describe('creates', () => {
    it('should call the integrationPrismaClientService for create', async () => {
      const createSpy = jest.spyOn(service.externalSystem, 'create');
      jest.spyOn(prismaClientService.externalSystem, 'create');
      const result = await service.externalSystem.create({
        data: {
          name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE,
          uiName: 'Test use only',
          uiDescription: 'Test use only',
        },
      });
      expect(prismaClientService.externalSystem.create).not.toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty(
        'name',
        $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE,
      );
      // Ensure mock call with this mock property
      expect(result).toHaveProperty('mockCalled', true);
    });
    it('should call the integrationPrismaClientService for createMany', async () => {
      const createManySpy = jest.spyOn(service.externalSystem, 'createMany');
      jest.spyOn(prismaClientService.externalSystem, 'createMany');

      const result = await service.externalSystem.createMany({
        data: [
          {
            name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE,
            uiName: 'Test use only',
            uiDescription: 'Test use only',
          },
        ],
      });

      expect(
        prismaClientService.externalSystem.createMany,
      ).not.toHaveBeenCalled();
      expect(createManySpy).toHaveBeenCalledTimes(1);

      // Check if the result has a property 'count' with the value 1
      expect(result).toHaveProperty('count', 1);
      // Ensure mock call with this mock property
      expect(result).toHaveProperty('mockCalled', true);
    });
    it('should call the integrationPrismaClientService for upsert', async () => {
      const upsertSpy = jest.spyOn(service.externalSystem, 'upsert');
      jest.spyOn(prismaClientService.externalSystem, 'upsert');

      const targetName = $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE;
      const result = await service.externalSystem.upsert({
        where: { name: targetName },
        create: {
          name: targetName,
          uiName: 'Test use only',
          uiDescription: 'Test use only',
        },
        update: {
          uiName: 'Updated ui name',
        },
      });

      expect(prismaClientService.externalSystem.upsert).not.toHaveBeenCalled();
      expect(upsertSpy).toHaveBeenCalledTimes(1);

      expect(result).toHaveProperty('name', targetName);
      // Ensure mock call with this mock property
      expect(result).toHaveProperty('mockCalled', true);
    });
  });
  describe('updates', () => {
    it('should call the integrationPrismaClientService for update', async () => {
      const updateSpy = jest.spyOn(service.externalSystem, 'update');
      jest.spyOn(prismaClientService.externalSystem, 'update');

      const result = await service.externalSystem.update({
        where: { name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE },
        data: {
          uiName: 'Updated ui name',
        },
      });

      expect(prismaClientService.externalSystem.update).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledTimes(1);

      // Check if the result has a property 'uiName' with the updated value
      expect(result).toHaveProperty('uiName', 'Updated ui name');
      // Ensure mock call with this mock property
      expect(result).toHaveProperty('mockCalled', true);
    });

    it('should call the integrationPrismaClientService for updateMany', async () => {
      const updateManySpy = jest.spyOn(service.externalSystem, 'updateMany');
      jest.spyOn(prismaClientService.externalSystem, 'updateMany');

      const result = await service.externalSystem.updateMany({
        where: { name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE },
        data: {
          uiName: 'Updated ui name',
        },
      });

      expect(
        prismaClientService.externalSystem.updateMany,
      ).not.toHaveBeenCalled();
      expect(updateManySpy).toHaveBeenCalledTimes(1);

      // Check if the result has a property 'count' with the value 1
      expect(result).toHaveProperty('count', 1);
      // Ensure mock call with this mock property
      expect(result).toHaveProperty('mockCalled', true);
    });
  });
  describe('deletes', () => {
    it('should call the integrationPrismaClientService for delete', async () => {
      const deleteSpy = jest.spyOn(service.externalSystem, 'delete');
      jest.spyOn(prismaClientService.externalSystem, 'delete');

      const targetName = $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE;
      const result = await service.externalSystem.delete({
        where: { name: targetName },
      });

      expect(prismaClientService.externalSystem.delete).not.toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('name', targetName);
      // Ensure mock call with this mock property
      expect(result).toHaveProperty('mockCalled', true);
    });

    it('should call the integrationPrismaClientService for deleteMany', async () => {
      const deleteManySpy = jest.spyOn(service.externalSystem, 'deleteMany');
      jest.spyOn(prismaClientService.externalSystem, 'deleteMany');

      const result = await service.externalSystem.deleteMany({
        where: { name: $Enums.ExternalSystemName.TEST_USE_DO_NOT_USE },
      });

      expect(
        prismaClientService.externalSystem.deleteMany,
      ).not.toHaveBeenCalled();
      expect(deleteManySpy).toHaveBeenCalledTimes(1);

      // Check if the result has a property 'count' with the value 1
      expect(result).toHaveProperty('count', 1);
      // Ensure mock call with this mock property
      expect(result).toHaveProperty('mockCalled', true);
    });
  });
});
