import { Module } from '@nestjs/common';
import { EzcaterHandlerService } from './ezcater-handler.service';

@Module({
  providers: [EzcaterHandlerService]
})
export class EzcaterHandlerModule {}
