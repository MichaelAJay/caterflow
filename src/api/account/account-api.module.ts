import { Module } from '@nestjs/common';
import { CateringCompanyModule } from 'src/internal-modules/account/account.module';
import { CateringCompanyController } from './account.controller';

@Module({
  imports: [CateringCompanyModule],
  controllers: [CateringCompanyController],
})
export class CateringCompanyApiModule {}
