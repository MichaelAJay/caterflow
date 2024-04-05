import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { GetSystemIntegrationsValidatorTransformerMiddleware } from './middleware/get-integrations-validator-transformer/get-integrations-validator-transformer.middleware';

@Module({
  controllers: [IntegrationController],
})
export class IntegrationAPIModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetSystemIntegrationsValidatorTransformerMiddleware)
      .forRoutes({ path: 'integration/list', method: RequestMethod.GET });
  }
}
