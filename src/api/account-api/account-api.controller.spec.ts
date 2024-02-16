import { Test, TestingModule } from '@nestjs/testing';
import { AccountApiController } from './account-api.controller';

describe('AccountApiController', () => {
  let controller: AccountApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountApiController],
    }).compile();

    controller = module.get<AccountApiController>(AccountApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
