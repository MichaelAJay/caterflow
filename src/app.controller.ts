import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { BypassAccountRequirement } from './common/decorators/bypass-account-requirement.decorator';

@Controller('app')
export class AppController {
  @Public()
  @Get('health/public')
  async getPublicHealth() {
    return this.getHealth();
  }

  @BypassAccountRequirement()
  @Get('health')
  async getHealth() {
    return {
      status: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
