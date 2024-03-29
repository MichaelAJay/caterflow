import { Module } from '@nestjs/common';
import { CompanyRoleService } from './company-role.service';

@Module({
  providers: [CompanyRoleService]
})
export class RoleAndPermissionModule {}
