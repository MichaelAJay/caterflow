import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { CateringCompanyService } from '../../internal-modules/catering-company/catering-company.service';
import { validateCreateCateringCompanyRequestBody } from './validators/post.caterer';
import { ICateringCompanyController } from './interfaces/catering-company.controller.interface';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { BypassCateringCompanyRequirement } from '../../common/decorators/bypass-company-requirement.decorator';
import { ERROR_CODE } from '../../common/codes/error-codes';
import { SUCCESS_CODE } from '../../common/codes/success-codes';

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
      message: 'Your company was successfully created!',
      code: SUCCESS_CODE.CompanyCreated,
    };
  }
}
