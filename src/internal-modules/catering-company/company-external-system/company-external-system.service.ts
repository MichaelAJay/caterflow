import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { CompanyConnectionAsset } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';
import { EzcaterHandlerService } from 'src/internal-modules/external-handlers/external-system-handler/ezcater-handler.service';
import { NutshellHandlerService } from 'src/internal-modules/external-handlers/external-system-handler/nutshell-handler.service';

type Reasons = 'NOT_APPLICABLE';

type Tested = {
  tested: true;
  passed: boolean;
};

type Untested = {
  tested: false;
  reason: 'NOT_APPLICABLE';
};

@Injectable()
export class CompanyExternalSystemService {
  constructor(
    private readonly ezCaterHandler: EzcaterHandlerService,
    private readonly nutshellHandler: NutshellHandlerService,
  ) {}

  async testOutboundConnection(
    systemName: $Enums.ExternalSystemName,
    companyId: string,
    companyConnectionAssets: CompanyConnectionAsset,
  ): Promise<Tested | Untested> {
    try {
      switch (systemName) {
        case $Enums.ExternalSystemName.EZ_CATER:
          return {
            tested: true,
            passed: await this.ezCaterHandler.testOutboundConnection(
              companyId,
              companyConnectionAssets,
            ),
          };
        case $Enums.ExternalSystemName.NUTSHELL:
          return {
            tested: true,
            passed: await this.nutshellHandler.testOutboundConnection(
              companyId,
              companyConnectionAssets,
            ),
          };
        // This section (could have multiple cases) is for external systems that don't require config
        case $Enums.ExternalSystemName.TEST_NO_OUTBOUND_CONFIG:
          return { tested: true, passed: true };
        // This section (could have multiple cases) is for external systems which should never make outbound requests
        case $Enums.ExternalSystemName.TEST_NO_OUTBOUND:
          return { tested: false, reason: 'NOT_APPLICABLE' };
        // This section is for unhandled cases - we should never reach it
        default:
          // case $Enums.ExternalSystemName.TEST_NO_OUTBOUND:
          // Log
          throw new Error('Oops I did it again');
      }
    } catch (err) {
      // This would handle a handler-thrown error
      // Should probably system log & company log
      throw err;
    }
  }

  async initializeConnection() {}
}
