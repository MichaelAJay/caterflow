import { Test, TestingModule } from '@nestjs/testing';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import queryBuilderUtilities from './utilities/query-builder-utilities';
import { Prisma } from '@prisma/client';
import { IBuildGetManyQueryInputArgs } from './interfaces/query-builder-args.interfaces';

describe('SystemIntegrationDbQueryBuilderService', () => {
  let service: SystemIntegrationDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemIntegrationDbQueryBuilderService],
    }).compile();

    service = module.get<SystemIntegrationDbQueryBuilderService>(
      SystemIntegrationDbQueryBuilderService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests must be created for buildFindManyQuery
  it('should fail', () => {
    expect(true).toBe(false);
  });

  describe('buildFindManyQuery', () => {});
});
