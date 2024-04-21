import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { GetSystemIntegrationsValidatorTransformerMiddleware } from './middleware/get-integrations-validator-transformer/get-integrations-validator-transformer.middleware';
import { IntegrationsModule } from 'src/internal-modules/integrations/integrations.module';
import { ExternalSystemController } from './external-system.controller';

@Module({
  imports: [IntegrationsModule],
  controllers: [IntegrationController, ExternalSystemController],
})
export class IntegrationAPIModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetSystemIntegrationsValidatorTransformerMiddleware)
      .forRoutes({ path: 'integration/list', method: RequestMethod.GET });
  }
}
