import { Module } from '@nestjs/common';
import { EzcaterWebhookReceiverController } from './ezcater-webhook-receiver.controller';
import { CateringCompanyModule } from 'src/internal-modules/catering-company/catering-company.module';

@Module({
  imports: [CateringCompanyModule],
  controllers: [EzcaterWebhookReceiverController],
})
export class WebhookReceiverApiModule {}
