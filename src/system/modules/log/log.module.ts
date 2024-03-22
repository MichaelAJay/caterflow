import { Global, Module } from '@nestjs/common';
import { LogService } from './log.service';
import { CustomConfigModule } from 'src/utility/services/custom-config/custom-config.module';

@Global()
@Module({
  imports: [CustomConfigModule],
  providers: [LogService],
})
export class LogModule {}
