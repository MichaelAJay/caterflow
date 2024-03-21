import { Module } from '@nestjs/common';
import { RolePermissionDbHandlerService } from './role-permission-db-handler.service';
import { RolePermissionDbQueryBuilderService } from './role-permission-db-query-builder.service';
import { PrismaClientModule } from 'src/external-modules/prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  providers: [
    RolePermissionDbHandlerService,
    RolePermissionDbQueryBuilderService,
  ],
  exports: [RolePermissionDbHandlerService],
})
export class RolePermissionDbHandlerModule {}
