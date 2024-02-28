import { Controller, Get, Post, Req } from '@nestjs/common';
import { IUserController } from './interfaces/user.controller.interface';
import { BypassAccountRequirement } from '../../common/decorators/bypass-account-requirement.decorator';
import {
  AuthenticatedRequest,
  AuthenticatedRequestForNewUser,
} from '../interfaces/authenticated-request.interface';
import { BypassUserRequirement } from '../../common/decorators/bypass-user-requirement.decorator';
import { UserService } from '../../internal-modules/user/user.service';

@Controller('user')
export class UserController implements IUserController {
  constructor(private readonly userService: UserService) {}

  @BypassAccountRequirement()
  @BypassUserRequirement()
  @Post()
  async createUser(req: AuthenticatedRequestForNewUser): Promise<any> {
    const { user } = req;
    const { name, email, external_auth_uid: externalAuthUID } = user;
    return this.userService.createUser(name, email, externalAuthUID);
  }

  @BypassAccountRequirement()
  @Get('account-status')
  async getUserAccountStatus(@Req() req: AuthenticatedRequest) {
    return { hasAccount: !!(req.user && req.user.accountId) };
  }
}
