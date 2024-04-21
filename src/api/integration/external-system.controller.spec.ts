import { Test, TestingModule } from '@nestjs/testing';
import { ExternalSystemController } from './external-system.controller';

describe('ExternalSystemController', () => {
  let controller: ExternalSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalSystemController],
    }).compile();

    controller = module.get<ExternalSystemController>(ExternalSystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
