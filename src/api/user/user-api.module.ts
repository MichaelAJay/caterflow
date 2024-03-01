import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserModule } from 'src/internal-modules/user/user.module';
import { GuardModule } from 'src/common/guards/guard/guard.module';

@Module({
  imports: [UserModule, GuardModule],
  controllers: [UserController],
})
export class UserApiModule {}
