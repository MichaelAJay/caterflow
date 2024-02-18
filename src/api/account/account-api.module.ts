import { Module } from '@nestjs/common';
import { AccountModule } from 'src/internal-modules/account/account.module';
import { AccountController } from './account.controller';

@Module({
  imports: [AccountModule],
  controllers: [AccountController],
})
export class AccountApiModule {}
