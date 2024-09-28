import { Module } from '@nestjs/common';
import { EzcaterHandlerService } from './ezcater-handler.service';
import { NutshellHandlerService } from './nutshell-handler.service';
import { NoAssetsHandlerService } from './no-assets-handler.service';
import { NoOutboundHandlerService } from './no-outbound-handler.service';
import { NoInboundHandlerService } from './no-inbound-handler.service';
import { EzCaterApiModule } from '../../../external-modules/ezcater-api/ezcater-api.module';
import { NutshellApiModule } from '../../../external-modules/nutshell-api/nutshell-api.module';

@Module({
  imports: [EzCaterApiModule, NutshellApiModule],
  providers: [
    EzcaterHandlerService,
    NutshellHandlerService,
    NoAssetsHandlerService,
    NoOutboundHandlerService,
    NoInboundHandlerService,
  ],
  exports: [
    EzcaterHandlerService,
    NutshellHandlerService,
    NoAssetsHandlerService,
    NoOutboundHandlerService,
    NoInboundHandlerService,
  ],
})
export class ExternalSystemHandlerModule {}
