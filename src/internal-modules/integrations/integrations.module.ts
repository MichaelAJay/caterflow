import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { CateringCompanyDbHandlerModule } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';

@Module({
  imports: [CateringCompanyDbHandlerModule],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
