import { Module } from '@nestjs/common';
import { AuthApiController } from './auth-api.controller';

@Module({
  controllers: [AuthApiController]
})
export class AuthApiModule {}
