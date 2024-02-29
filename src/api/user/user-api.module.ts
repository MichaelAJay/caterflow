import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserModule } from 'src/internal-modules/user/user.module';
import { FirebaseAdminModule } from 'src/external-modules/firebase-admin/firebase-admin.module';

@Module({
  imports: [UserModule, FirebaseAdminModule],
  controllers: [UserController],
})
export class UserApiModule {}
