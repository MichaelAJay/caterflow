import { Module } from '@nestjs/common';
import { CateringCompanyModule } from 'src/internal-modules/catering-company/catering-company.module';
import { CateringCompanyController } from './catering-company.controller';

@Module({
  imports: [CateringCompanyModule],
  controllers: [CateringCompanyController],
})
export class CateringCompanyApiModule {}
