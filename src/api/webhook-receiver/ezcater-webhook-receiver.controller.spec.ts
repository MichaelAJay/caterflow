import { Test, TestingModule } from '@nestjs/testing';
import { EzcaterWebhookReceiverController } from './ezcater-webhook-receiver.controller';

describe('EzcaterWebhookReceiverController', () => {
  let controller: EzcaterWebhookReceiverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EzcaterWebhookReceiverController],
    }).compile();

    controller = module.get<EzcaterWebhookReceiverController>(EzcaterWebhookReceiverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
