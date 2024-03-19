import { Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IUserController } from './interfaces/user.controller.interface';
import { BypassCateringCompanyRequirement } from '../../common/decorators/bypass-company-requirement.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserService } from '../../internal-modules/user/user.service';
import { SUCCESS_CODE } from '../../common/codes/success-codes';
import { LogIn } from '../../common/decorators/login.decorator';
import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginGuard } from '../../common/guards/login/login.guard';

@Controller('user')
export class UserController implements IUserController {
  constructor(private readonly userService: UserService) {}

  // @NewUser()
  // @Post()
  // async createUser(@Req() req: AuthenticatedRequestForNewUser): Promise<any> {
  //   const { user } = req;
  //   const { name, email, external_auth_uid: externalAuthUID } = user;
  //   await this.userService.createUser(name, email, externalAuthUID);
  //   return {
  //     message: '', // This should succeed silently (from user perspective)
  //     code: SUCCESS_CODE.UserCreated,
  //   };
  // }

  // @BypassCateringCompanyRequirement()
  // @Get('company-status')
  // async getUserCateringCompanyStatus(@Req() req: AuthenticatedRequest) {
  //   return { hasCateringCompany: !!(req.user && req.user.companyId) };
  // }

  @BypassCateringCompanyRequirement()
  @Patch('verify-email')
  async verifyEmail(@Req() req: AuthenticatedRequest) {
    const { user } = req;
    // Short circuit if internal user record already has verified email true
    if (!user.internalUserEmailVerificationStatus) {
      await this.userService.updateUser(user.id, { emailVerified: true });
    }
    return {
      message: '',
      code: SUCCESS_CODE.EmailVerified,
    };
  }

  @LogIn()
  @UseGuards(LoginGuard)
  @Post('login')
  async login(@Req() req: LoginRequest): Promise<{ hasCompany: boolean }> {
    if (req.userFound) {
      if (req.requiresEmailVerificationSync) {
        console.log('requires sync');
        await this.userService.updateUser(req.userId, {
          emailVerified: req.externalEmailVerificationStatus,
        });
      }

      return { hasCompany: req.userHasCompany };
    } else {
      const { user } = req;
      await this.userService.createUser(
        user.name,
        user.email,
        user.external_auth_uid,
        user.emailVerified,
      );
      return { hasCompany: false };
    }
  }
}
