import { Module } from '@nestjs/common';
import { NutshellApiService } from './nutshell-api.service';

@Module({
  providers: [NutshellApiService],
  exports: [NutshellApiService],
})
export class NutshellApiModule {}
