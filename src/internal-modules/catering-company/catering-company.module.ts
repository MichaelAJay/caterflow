import { Module } from '@nestjs/common';
import { CateringCompanyService } from './catering-company.service';
import { CateringCompanyDbHandlerModule } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { UserDbHandlerModule } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.module';
import { CompanyRoleAndPermissionDbHandlerModule } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.module';
import { CompanyMapperService } from './company-mapper.service';
import { SecretManagerModule } from '../external-handlers/secret-manager/secret-manager.module';
import { CompanyExternalSystemService } from './company-external-system/company-external-system.service';
import { CompanyIntegrationAndConnectionService } from './company-integration-and-connection/company-integration-and-connection.service';
import { ExternalSystemHandlerModule } from '../external-handlers/external-system-handler/external-system-handler.module';

@Module({
  imports: [
    CateringCompanyDbHandlerModule,
    UserDbHandlerModule,
    CompanyRoleAndPermissionDbHandlerModule,
    SecretManagerModule,
    ExternalSystemHandlerModule,
  ],
  providers: [
    CateringCompanyService,
    CompanyMapperService,
    CompanyExternalSystemService,
    CompanyIntegrationAndConnectionService,
  ],
  exports: [CateringCompanyService],
})
export class CateringCompanyModule {}
