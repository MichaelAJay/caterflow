import { PrismaClientService } from 'src/external-modules/prisma-client/prisma-client.service';
import { ActionLoggingInterceptor } from './action-logging.interceptor';
import { TestingModule, Test } from '@nestjs/testing';
import { LoggingInterceptor } from '../logging/logging.interceptor';
import { mockPrismaClientService } from 'test/mocks/providers/mock_prisma_client';

describe('ActionLoggingInterceptor', () => {
  let interceptor: ActionLoggingInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: PrismaClientService,
          useValue: mockPrismaClientService,
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  it('should be defined with all dependencies injected', () => {
    expect(interceptor).toBeDefined();
  });
});
