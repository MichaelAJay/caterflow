import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from 'src/internal-modules/account/account.service';
import { validateCreateAccountRequestBody } from './validators/post.account';
import { IAccountController } from './interfaces/account.controller.interface';

@Controller('account')
export class AccountController implements IAccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async createAccount(@Body() body: any) {
    /**
     * What data needs to be in the create account?
     *
     * Account name
     * Account owner: {
     *  name
     *  email
     *  password
     * }
     */
    if (!validateCreateAccountRequestBody(body)) {
      throw new Error('ARGH!');
    }
    const { name, owner, email, password } = body;
    return this.accountService.createAccount(name, owner, email, password);
  }
}
