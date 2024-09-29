import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationPrismaClientService } from '../test/classes/integration-prisma-client-service.mock-provider';
import { PrismaClientService } from './external-modules/prisma-client/prisma-client.service';
import { $Enums } from '@prisma/client';
import { Prisma } from '@sentry/node/types/tracing/integrations';

describe('IntegrationPrismaClientService', () => {
  let service: IntegrationPrismaClientService;
  let prismaClientService: PrismaClientService;
  // let prismaClientService: jest.Mocked<PrismaClientService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationPrismaClientService,
        // {
        //   provide: PrismaClientService,
        //   useValue: {
        //     externalSystem: {
        //       // findUnique: jest.fn(),
        //     },
        //   },
        // },
        PrismaClientService,
      ],
    }).compile();

    service = module.get<IntegrationPrismaClientService>(
      IntegrationPrismaClientService,
    );
    prismaClientService = module.get(PrismaClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('finds', () => {
    it('should call the prismaClientService for findUnique', async () => {
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
