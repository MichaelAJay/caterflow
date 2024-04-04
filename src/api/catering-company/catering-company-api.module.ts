import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CateringCompanyModule } from 'src/internal-modules/catering-company/catering-company.module';
import { CateringCompanyController } from './catering-company.controller';
import { GetIntegrationsValidatorTransformerMiddleware } from './middleware/get-integrations-validator-transformer/get-integrations-validator-transformer.middleware';

@Module({
  imports: [CateringCompanyModule],
  controllers: [CateringCompanyController],
})
export class CateringCompanyApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetIntegrationsValidatorTransformerMiddleware)
      .forRoutes({ path: 'caterer/integrations', method: RequestMethod.GET });
  }
}
