import { Module } from '@nestjs/common';
import { CateringCompanyDbHandlerService } from './catering-company-db-handler.service';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientModule } from 'src/external-modules/prisma-client/prisma-client.module';
import { SystemIntegrationDbHandlerService } from './system-integration-db-handler.service';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';

@Module({
  imports: [PrismaClientModule],
  providers: [
    CateringCompanyDbHandlerService,
    CateringCompanyDbQueryBuilderService,
    SystemIntegrationDbHandlerService,
    SystemIntegrationDbQueryBuilderService,
  ],
  exports: [CateringCompanyDbHandlerService, SystemIntegrationDbHandlerService],
})
export class CateringCompanyDbHandlerModule {}
