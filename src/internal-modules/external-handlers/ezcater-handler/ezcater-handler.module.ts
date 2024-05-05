import { Module } from '@nestjs/common';
import { EzCaterHandlerService } from './ezcater-handler.service';
import { EzCaterApiModule } from 'src/external-modules/ezcater-api/ezcater-api.module';

@Module({
  imports: [EzCaterApiModule],
  providers: [EzCaterHandlerService],
  exports: [EzCaterHandlerService],
})
export class EzcaterHandlerModule {}
