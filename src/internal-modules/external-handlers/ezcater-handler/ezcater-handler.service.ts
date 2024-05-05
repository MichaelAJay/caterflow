import { Injectable } from '@nestjs/common';
import { EzCaterApiService } from 'src/external-modules/ezcater-api/ezcater-api.service';

@Injectable()
export class EzCaterHandlerService {
  constructor(private readonly ezCaterApiService: EzCaterApiService) {}

  async getCaterers(companyId: string, companyAssetId: string) {
    const caterers = await this.ezCaterApiService.getCaterers(
      companyId,
      companyAssetId,
    );

    // Map if necessary
    return caterers;
  }
}
