import { Module } from '@nestjs/common';
import { CateringCompanyDbHandlerService } from './catering-company-db-handler.service';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientModule } from 'src/external-modules/prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  providers: [
    CateringCompanyDbHandlerService,
    CateringCompanyDbQueryBuilderService,
  ],
  exports: [CateringCompanyDbHandlerService],
})
export class CateringCompanyDbHandlerModule {}
