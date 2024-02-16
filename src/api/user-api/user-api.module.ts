import { Module } from '@nestjs/common';
import { UserApiController } from './user-api.controller';

@Module({
  controllers: [UserApiController]
})
export class UserApiModule {}
