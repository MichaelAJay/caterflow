import { Module } from '@nestjs/common';
import { AccountApiController } from './account-api.controller';

@Module({
  controllers: [AccountApiController]
})
export class AccountApiModule {}
