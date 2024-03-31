import { Module } from '@nestjs/common';
import { CateringCompanyService } from './catering-company.service';
import { CateringCompanyDbHandlerModule } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { UserDbHandlerModule } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.module';
import { CompanyRoleAndPermissionDbHandlerModule } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.module';

@Module({
  imports: [
    CateringCompanyDbHandlerModule,
    UserDbHandlerModule,
    CompanyRoleAndPermissionDbHandlerModule,
  ],
  providers: [CateringCompanyService],
  exports: [CateringCompanyService],
})
export class CateringCompanyModule {}
