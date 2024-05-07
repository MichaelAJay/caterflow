import { Module } from '@nestjs/common';
import { CateringCompanyService } from './catering-company.service';
import { CateringCompanyDbHandlerModule } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { UserDbHandlerModule } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.module';
import { CompanyRoleAndPermissionDbHandlerModule } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.module';
import { CompanyMapperService } from './company-mapper.service';
import { SecretManagerModule } from '../external-handlers/secret-manager/secret-manager.module';
import { EzcaterHandlerModule } from '../external-handlers/ezcater-handler/ezcater-handler.module';

@Module({
  imports: [
    CateringCompanyDbHandlerModule,
    UserDbHandlerModule,
    CompanyRoleAndPermissionDbHandlerModule,
    SecretManagerModule,
    EzcaterHandlerModule,
  ],
  providers: [CateringCompanyService, CompanyMapperService],
  exports: [CateringCompanyService],
})
export class CateringCompanyModule {}
