import { Injectable } from '@nestjs/common';
import { ExternalSystemOutboundHandler } from './interfaces';
import { CompanyConnectionAsset } from '../db-handlers/catering-company-db-handler/types/company_connection_assets';
import { NutshellApiService } from '../../../external-modules/nutshell-api/nutshell-api.service';

@Injectable()
export class NutshellHandlerService implements ExternalSystemOutboundHandler {
  constructor(private readonly nutshellApiService: NutshellApiService) {}

  private checkOutboundAssets(assets: CompanyConnectionAsset): boolean {
    return !!assets.API_KEY && !!assets.API_USERNAME;
  }

  async testOutboundConnection(
    companyId: string,
    companyConnectionAssets: CompanyConnectionAsset,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
