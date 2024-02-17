import { Module } from '@nestjs/common';
import { AuthApiController } from './auth-api.controller';
import { AuthModule } from 'src/internal-modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AuthApiController],
})
export class AuthApiModule {}
