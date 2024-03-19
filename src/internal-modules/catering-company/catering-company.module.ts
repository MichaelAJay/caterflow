import { Module } from '@nestjs/common';
import { CateringCompanyService } from './catering-company.service';
import { CateringCompanyDbHandlerModule } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { UserDbHandlerModule } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.module';

@Module({
  imports: [CateringCompanyDbHandlerModule, UserDbHandlerModule],
  providers: [CateringCompanyService],
  exports: [CateringCompanyService],
})
export class CateringCompanyModule {}
