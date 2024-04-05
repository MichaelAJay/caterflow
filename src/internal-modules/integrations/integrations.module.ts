import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { CateringCompanyDbHandlerModule } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { IntegrationsMapperService } from './integrations-mapper.service';

@Module({
  imports: [CateringCompanyDbHandlerModule],
  providers: [IntegrationsService, IntegrationsMapperService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
