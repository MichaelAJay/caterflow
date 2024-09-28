import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotImplementedException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { CateringCompanyService } from '../../internal-modules/catering-company/catering-company.service';
import { validateCreateCateringCompanyRequestBody } from './validators/post.caterer';
import { ICateringCompanyController } from './interfaces/catering-company.controller.interface';
import {
  AuthenticatedRequest,
  AuthenticatedRequestForCompanyUser,
} from '../interfaces/authenticated-request.interface';
import { BypassCateringCompanyRequirement } from '../../common/decorators/bypass-company-requirement.decorator';
import { ERROR_CODE } from '../../common/codes/error-codes';
import { SUCCESS_CODE } from '../../common/codes/success-codes';
import { IBuildGetCompanyIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { $Enums } from '@prisma/client';
import { isRequirementType } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';

@Controller('caterer')
export class CateringCompanyController implements ICateringCompanyController {
  constructor(
    private readonly cateringCompanyService: CateringCompanyService,
  ) {}

  @BypassCateringCompanyRequirement()
  @Post()
  async createCateringCompany(
    @Body() body: any,
    @Req() req: AuthenticatedRequest,
  ) {
    const validationResult = validateCreateCateringCompanyRequestBody(body);
    if (!validationResult.valid) {
      throw new BadRequestException({
        message: 'Invalid request body',
        code: ERROR_CODE.InvalidRequestBody,
        errors: validationResult.errors,
      });
    }

    const { name } = validationResult.data;
    const { user } = req;
    if (user.companyId !== null) {
      throw new ConflictException({
        message: 'This user is already associated with a company',
        code: ERROR_CODE.CompanyExists,
      });
    }

    await this.cateringCompanyService.createCateringCompany(name, user.id);
    return {
      message: 'Your company details were successfully added!',
      code: SUCCESS_CODE.CompanyCreated,
    };
  }

  @Get('users')
  async getUsers() {
    throw new NotImplementedException('Not implemented');
  }

  @Get('roles')
  async getRoles() {
    throw new NotImplementedException('Not implemented');
  }

  /**
   * ********************
   * *** INTEGRATIONS ***
   * ********************
   */
  @Get('ezcater-webhook-url')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async getEzCaterWebhookUrl(@Req() req: AuthenticatedRequestForCompanyUser) {
    return this.cateringCompanyService.retrieveEzCaterWebhookUrl(
      req.user.companyId,
    );
  }

  @Get('integrations')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async getIntegrations(
    @Req() req: AuthenticatedRequestForCompanyUser,
    @Query() query: IBuildGetCompanyIntegrationListArgs,
  ) {
    return this.cateringCompanyService.retrieveIntegrationsList(
      req.user.companyId,
      Object.keys(query).length > 0 ? query : undefined,
    );
  }

  @Get('connections')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async getConnections(
    @Req() req: AuthenticatedRequestForCompanyUser,
    @Query() query: IBuildGetCompanyIntegrationListArgs,
  ) {
    return this.cateringCompanyService.retrieveConnectionsList(
      req.user.companyId,
      Object.keys(query).length > 0 ? query : undefined,
    );
  }

  @Get('integration-assets')
  async getIntegrationAssets() {
    throw new NotImplementedException('Not implemented');
  }

  @Post('integration/create-from/:templateId')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async createIntegration(
    @Req() req: AuthenticatedRequestForCompanyUser,
    @Param('templateId', ParseIntPipe) templateId: number,
  ) {
    const { user } = req;
    // Not implemented
    return this.cateringCompanyService.createIntegration(
      user.companyId,
      templateId,
      user.id,
    );
  }

  @Post('connection/create-from/:systemId')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async createExternalSystemConnection(
    @Req() req: AuthenticatedRequestForCompanyUser,
    @Param('systemName') systemName: string,
  ) {
    /**
     * @TODO validate systemname
     */

    const { user } = req;
    return this.cateringCompanyService.createExternalSystemConnection(
      user.companyId,
      systemName as $Enums.ExternalSystemName,
    );
  }

  @Patch('connection/:connectionId/asset/:requirementType')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrationAssets])
  async addExternalSystemConnectionAsset(
    @Req() req: AuthenticatedRequestForCompanyUser,
    @Param('connectionId') connectionId: string,
    @Param('requirementType') requirementType: any,
    @Body() payload: any,
  ) {
    // Validate requirementType
    if (!isRequirementType(requirementType)) {
      throw new BadRequestException('Invalid requirement type');
    }

    if (typeof payload === 'undefined') {
      throw new BadRequestException('Payload undefined.');
    }

    const { user } = req;
    // Requires refactor - this is now more of an update than it is a create
    // return this.cateringCompanyService.createExternalSystemConnectionAsset(
    //   user.companyId,
    //   connectionId,
    //   requirementId,
    //   payload,
    //   user.id,
    // );
  }

  @Get('connection/:connectionId')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrationAssets])
  async getConnectionById(
    @Req() req: AuthenticatedRequestForCompanyUser,
    @Param('connectionId') connectionId: string,
  ) {
    return this.cateringCompanyService.getConnection(
      req.user.companyId,
      connectionId,
    );
  }

  @Post('import-caterers-from-ezcater')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageCompanyCaterers])
  async importCompanyCaterersFromEzCater(
    @Req() req: AuthenticatedRequestForCompanyUser,
  ) {
    const { user } = req;
    return this.cateringCompanyService.importCaterersFromEzCater(
      user.companyId,
    );
  }
}
