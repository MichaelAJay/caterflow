import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaClientModule } from 'src/external-modules/prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
