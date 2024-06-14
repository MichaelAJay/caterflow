import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICateringCompanyService } from './interfaces/catering-company.service.interface';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { CompanyMapperService } from './company-mapper.service';
import { IBuildGetCompanyIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { SecretManagerService } from '../external-handlers/secret-manager/secret-manager.service';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { EzCaterHandlerService } from '../external-handlers/ezcater-handler/ezcater-handler.service';
import { $Enums } from '@prisma/client';
import { ERROR_CODE } from 'src/common/codes/error-codes';
import { CompanyExternalSystemService } from './company-external-system/company-external-system.service';
import { CompanyIntegrationAndConnectionService } from './company-integration-and-connection/company-integration-and-connection.service';

@Injectable()
export class CateringCompanyService implements ICateringCompanyService {
  async getConnection(companyId: string, connectionId: string) {
    // First, try to carry out test. If it doesn't pass, throw an error
    const record =
      await this.cateringCompanyDbHandler.getConnection(connectionId);
    return record;
  }
  constructor(
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService,
    private readonly companyMapper: CompanyMapperService,
    private readonly secretManager: SecretManagerService,
    private readonly ezCaterHandler: EzCaterHandlerService,
    private readonly companyExternalSystemService: CompanyExternalSystemService,
    private readonly companyIntegrationAndConnectionService: CompanyIntegrationAndConnectionService,
  ) {}

  /**
   * Refactor 20 Apr 24
   */
  async createCateringCompany(name: string, ownerId: string): Promise<any> {
    const company = await this.cateringCompanyDbHandler.createCateringCompany(
      name,
      ownerId,
    );
    await this.companyRoleDbHandler.initializeRolesAndAssignOwner(
      company.id,
      ownerId,
    );
    return;
  }

  /**
   * ****************
   * *** CATERERS ***
   * ****************
   */
  async createCaterer() {}

  /**
   * ********************
   * *** INTEGRATIONS ***
   * ********************
   */

  async retrieveEzCaterWebhookUrl(companyId: string) {
    const baseUrl = 'http://localhost:8080'; // @TODO fix
    return { url: `${baseUrl}/ezcater-webhook-receiver/${companyId}` };
  }

  async retrieveIntegrationsList(
    companyId: string,
    query?: IBuildGetCompanyIntegrationListArgs,
  ): Promise<any> {
    // const records =
    //   await this.cateringCompanyDbHandler.retrieveCompanyIntegrationsList(
    //     companyId,
    //     query,
    //   );
    // const mappedList =
    //   this.companyMapper.mapCompanyIntegrationListForOutput(records);
    // return mappedList;
    // return records;
  }

  async retrieveConnectionsList(
    companyId: string,
    query?: IBuildGetCompanyIntegrationListArgs,
  ): Promise<any> {
    const records = await this.cateringCompanyDbHandler.getConnections(
      companyId,
      query,
    );
    return records;
  }

  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<any> {
    // const results = await this.cateringCompanyDbHandler.createIntegration(
    //   companyId,
    //   templateId,
    //   creatorId,
    // );
    // return results;
    // When an integration is created, it's quite similar to how an external system connection is created, but in reverse
  }

  async createExternalSystemConnection(companyId: string, systemId: number) {
    const record =
      await this.companyIntegrationAndConnectionService.createExternalSystemConnection(
        companyId,
        systemId,
      );

    return record;
  }

  /**
   * Due to the refactor June 13, 2024, there's no service-level creation of connection assets
   * Connection assets are in a JSON attribute directly on the connection
   */
  // async createExternalSystemConnectionAsset(
  //   companyId: string,
  //   connectionId: string,
  //   requirementId: number,
  //   value: any,
  //   userId: string,
  // ) {
  //   await this.companyIntegrationAndConnectionService.createExternalSystemConnectionAsset(
  //     companyId,
  //     connectionId,
  //     requirementId,
  //     value,
  //   );

  //   return;
  // }

  async importCaterersFromEzCater(companyId: string) {
    // Check cache first

    // Retrieve company asset
    const assets: any = await this.cateringCompanyDbHandler.getAssets(
      companyId,
      $Enums.ExternalSystemName.EZ_CATER,
    );

    if (assets == null) {
      throw new Error('TODO: Change');
    }

    const asset = assets['API_KEY'];

    if (asset == null) {
      throw new NotFoundException('Company asset not found');
    }

    // Confirm ezCater connection is ready to use
    if (!asset.connection.isFullyConfigured) {
      throw new ConflictException(
        ERROR_CODE.IncompleteExternalSystemConnection,
      );
    }

    if (!asset.connection.isTested) {
      // First, try to carry out test. If it doesn't pass, throw an error
    }

    // Retrieve caterer records
    const caterers = await this.ezCaterHandler.getCaterers(companyId, asset.id);
    if (caterers.length === 0) {
      // Ensure user understands that no caterer records were returned
      return 'No caterers to add';
    }

    // This could potentially cause a problem because caterers is iterated over once here, and again in the db handler
    // How many is "a lot" of caterers for a company, and what's the performance impact of that?
    await this.cateringCompanyDbHandler.createCaterers(
      companyId,
      caterers.map((caterer) => ({
        name: caterer.name,
        storeNumber: caterer.storeNumber,
        ezCaterId: caterer.uuid,
      })),
    );
  }
}
