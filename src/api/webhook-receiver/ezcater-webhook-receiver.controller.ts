import { Controller, Param, Post } from '@nestjs/common';
import { CateringCompanyService } from 'src/internal-modules/catering-company/catering-company.service';

@Controller('ezcater-webhook-receiver')
export class EzcaterWebhookReceiverController {
  constructor(private readonly companyService: CateringCompanyService) {}

  @Post(':id')
  async postOrder(@Param('id') companyId: string) {
    console.log(companyId);
    // This needs to grab the company
  }
}
