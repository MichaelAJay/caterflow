import { Controller, Get } from '@nestjs/common';
import { IIntegrationController } from './interfaces/integration.controller.interface';

@Controller('integration')
export class IntegrationController implements IIntegrationController {
  @Get()
  async getIntegrations(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
