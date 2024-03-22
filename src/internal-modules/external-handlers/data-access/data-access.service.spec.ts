import { Test, TestingModule } from '@nestjs/testing';
import { DataAccessService } from './data-access.service';

describe('DataAccessService', () => {
  let service: DataAccessService<T>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataAccessService],
    }).compile();

    service = module.get<DataAccessService<any>>(DataAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
