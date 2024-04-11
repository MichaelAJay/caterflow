import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotImplementedException,
  Param,
  ParseIntPipe,
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
import { IBuildRetrieveCompanyIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { $Enums } from '@prisma/client';

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

  @Get('integrations')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async getIntegrations(
    @Req() req: AuthenticatedRequestForCompanyUser,
    @Query() query: IBuildRetrieveCompanyIntegrationListArgs,
  ) {
    return this.cateringCompanyService.retrieveIntegrationsList(
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
    return this.cateringCompanyService.createIntegration(
      user.companyId,
      templateId,
      user.id,
    );
  }

  @Post('integration/create-asset-from/:requirementId')
  async createIntegrationAsset(
    req: AuthenticatedRequestForCompanyUser,
    @Param('requirementId', ParseIntPipe) requirementId: number,
    @Body() body: any,
  ): Promise<any> {
    const { user } = req;
    return this.cateringCompanyService.createIntegrationAsset(
      user.companyId,
      requirementId,
      user.id,
    );
  }
}
