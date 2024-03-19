import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { BypassCateringCompanyRequirement } from './common/decorators/bypass-company-requirement.decorator';

@Controller('app')
export class AppController {
  @Public()
  @Get('health/public')
  async getPublicHealth() {
    return this.getHealth();
  }

  @BypassCateringCompanyRequirement()
  @Get('health')
  async getHealth() {
    return {
      status: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
