import { Global, Module } from '@nestjs/common';
import { LOGGER_PROVIDER_INJECTION_TOKEN, LogService } from './log.service';
import { CustomConfigModule } from '../../../utility/services/custom-config/custom-config.module';
import { CustomConfigService } from '../../../utility/services/custom-config/custom-config.service';
import * as path from 'path';
import * as fs from 'fs';
import pino from 'pino';

@Global()
@Module({
  imports: [CustomConfigModule],
  providers: [
    {
      provide: LOGGER_PROVIDER_INJECTION_TOKEN,
      useFactory: async (customConfigService: CustomConfigService) => {
        const logPath = customConfigService.getEnvVariable<string>(
          'logPath',
          './logs',
        );

        console.log('logPath', logPath);
        if (!fs.existsSync(logPath)) {
          fs.mkdirSync(logPath, { recursive: true });
        }

        const isProduction =
          customConfigService.getEnvVariable<string>('env') === 'production';
        const options: pino.LoggerOptions = {
          level: isProduction ? 'warn' : 'debug',
          transport: {
            target: 'pino/file',
            options: {
              destination: path.join(logPath, 'app.log'),
            },
          },
        };

        return pino(options);
      },
      inject: [CustomConfigService],
    },
    LogService,
  ],
  exports: [LogService],
})
export class LogModule {}
