import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { AccountService } from '../../internal-modules/account/account.service';
import { validateCreateAccountRequestBody } from './validators/post.account';
import { IAccountController } from './interfaces/account.controller.interface';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { BypassAccountRequirement } from '../../common/decorators/bypass-account-requirement.decorator';
import { ERROR_CODE } from '../../common/codes/error-codes';
import { SUCCESS_CODE } from '../../common/codes/success-codes';

@Controller('account')
export class AccountController implements IAccountController {
  constructor(private readonly accountService: AccountService) {}

  @BypassAccountRequirement()
  @Post()
  async createAccount(@Body() body: any, @Req() req: AuthenticatedRequest) {
    const validationResult = validateCreateAccountRequestBody(body);
    if (!validationResult.valid) {
      throw new BadRequestException({
        message: 'Invalid request body',
        code: ERROR_CODE.InvalidRequestBody,
        errors: validationResult.errors,
      });
    }

    const { name } = validationResult.data;
    const { user } = req;
    if (user.accountId !== undefined) {
      throw new ConflictException({
        message: 'This user is already associated with an account',
        code: ERROR_CODE.AccountExists,
      });
    }

    await this.accountService.createAccount(name, user.external_auth_uid);
    return {
      message: 'Your account was successfully created!',
      code: SUCCESS_CODE.AccountCreated,
    };
  }
}
