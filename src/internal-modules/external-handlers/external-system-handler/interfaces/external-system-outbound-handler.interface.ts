import { CompanyConnectionAsset } from '../../db-handlers/catering-company-db-handler/types/company_connection_assets';

export interface ExternalSystemOutboundHandler {
  testOutboundConnection(
    companyId: string,
    companyConnectionAssets: CompanyConnectionAsset,
  ): Promise<boolean>;
}
