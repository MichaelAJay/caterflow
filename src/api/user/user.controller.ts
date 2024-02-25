import { Controller, Get, Req } from '@nestjs/common';
import { IUserController } from './interfaces/user.controller.interface';
import { BypassAccountRequirement } from 'src/common/decorators/bypass-account-requirement.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Controller('user')
export class UserController implements IUserController {
  @BypassAccountRequirement()
  @Get('account-status')
  async getUserAccountStatus(@Req() req: AuthenticatedRequest) {
    return { hasAccount: !!(req.user && req.user.accountId) };
  }
}
