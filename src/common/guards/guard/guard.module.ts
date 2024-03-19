import { Module } from '@nestjs/common';
import { GuardService } from './guard.service';
import { FirebaseAdminModule } from 'src/external-modules/firebase-admin/firebase-admin.module';

@Module({
  imports: [FirebaseAdminModule],
  providers: [GuardService],
  exports: [GuardService],
})
export class GuardModule {}
