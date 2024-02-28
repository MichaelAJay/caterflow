import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserModule } from 'src/internal-modules/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [UserController],
})
export class UserApiModule {}
