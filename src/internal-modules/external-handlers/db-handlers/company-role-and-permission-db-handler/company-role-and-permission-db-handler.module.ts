import { Module } from '@nestjs/common';
import { CompanyRoleAndPermissionDbHandlerService } from './company-role-and-permission-db-handler.service';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientModule } from '../../../../external-modules/prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  providers: [
    CompanyRoleAndPermissionDbHandlerService,
    CompanyRoleAndPermissionDbQueryBuilderService,
  ],
  exports: [CompanyRoleAndPermissionDbHandlerService],
})
export class CompanyRoleAndPermissionDbHandlerModule {}
