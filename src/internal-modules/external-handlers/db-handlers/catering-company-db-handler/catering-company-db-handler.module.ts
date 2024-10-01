import { DynamicModule, Module, Provider } from '@nestjs/common';
import { CateringCompanyDbHandlerService } from './catering-company-db-handler.service';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientModule } from '../../../../external-modules/prisma-client/prisma-client.module';
import { SystemIntegrationDbHandlerService } from './system-integration-db-handler.service';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';

// @Module({
//   imports: [PrismaClientModule],
//   providers: [
//     CateringCompanyDbHandlerService,
//     CateringCompanyDbQueryBuilderService,
//     SystemIntegrationDbHandlerService,
//     SystemIntegrationDbQueryBuilderService,
//   ],
//   exports: [CateringCompanyDbHandlerService, SystemIntegrationDbHandlerService],
// })
// export class CateringCompanyDbHandlerModule {}

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
export class CateringCompanyDbHandlerModule {
  static forTesting(options: {
    prismaClientService: PrismaClientService;
  }): DynamicModule {
    return {
      module: CateringCompanyDbHandlerModule,
      providers: [
        {
          provide: PrismaClientService,
          useValue: options.prismaClientService,
        },
        CateringCompanyDbHandlerService,
        CateringCompanyDbQueryBuilderService,
        SystemIntegrationDbHandlerService,
        SystemIntegrationDbQueryBuilderService,
      ],
      exports: [
        CateringCompanyDbHandlerService,
        SystemIntegrationDbHandlerService,
      ],
    };
  }
}
