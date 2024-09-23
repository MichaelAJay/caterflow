import { Injectable } from '@nestjs/common';
import {
  ExternalSystemOutboundHandler,
  ExternalSystemInboundHandler,
} from './interfaces';
import { EzCaterApiService } from 'src/external-modules/ezcater-api/ezcater-api.service';
import { CompanyConnectionAsset } from '../db-handlers/catering-company-db-handler/types/company_connection_assets';

@Injectable()
export class EzcaterHandlerService
  implements ExternalSystemOutboundHandler, ExternalSystemInboundHandler
{
  constructor(private readonly ezCaterApiService: EzCaterApiService) {}

  private checkOutboundAssets(assets: CompanyConnectionAsset): boolean {
    return !!assets.API_KEY;
  }

  async testOutboundConnection(
    companyId: string,
    assets: CompanyConnectionAsset,
  ): Promise<boolean> {
    return !!(await this.getCaterers(companyId, assets));
  }

  async getCaterers(companyId: string, assets: CompanyConnectionAsset) {
    if (!this.checkOutboundAssets(assets)) {
      // Should log for company
      // error
      throw new Error(`oops i did it again ${companyId}`);
    }

    const caterers = await this.ezCaterApiService.getCaterers(
      companyId,
      assets,
    );

    // Map if necessary
    return caterers;
  }
}
