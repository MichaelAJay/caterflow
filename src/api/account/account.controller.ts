import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { CateringCompanyService } from '../../internal-modules/account/account.service';
import { validateCreateCateringCompanyRequestBody } from './validators/post.account';
import { ICateringCompanyController } from './interfaces/account.controller.interface';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { BypassCateringCompanyRequirement } from '../../common/decorators/bypass-account-requirement.decorator';
import { ERROR_CODE } from '../../common/codes/error-codes';
import { SUCCESS_CODE } from '../../common/codes/success-codes';

@Controller('caterer')
export class CateringCompanyController implements ICateringCompanyController {
  constructor(private readonly accountService: CateringCompanyService) {}

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
    if (user.accountId !== null) {
      throw new ConflictException({
        message: 'This user is already associated with an account',
        code: ERROR_CODE.CateringCompanyExists,
      });
    }

    await this.accountService.createCateringCompany(name, user.id);
    return {
      message: 'Your account was successfully created!',
      code: SUCCESS_CODE.CateringCompanyCreated,
    };
  }
}
