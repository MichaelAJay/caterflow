import { Injectable } from '@nestjs/common';
import { ILogService } from './interfaces/log.service.interface';
import pino, { LoggerOptions } from 'pino';
import { CustomConfigService } from 'src/utility/services/custom-config/custom-config.service';
import * as path from 'path';
import * as fs from 'fs';

type LogContext = Record<string, any>;

@Injectable()
export class LogService implements ILogService {
  private logger: pino.Logger;

  constructor(private readonly customConfigService: CustomConfigService) {
    const logPath = this.customConfigService.getEnvVariable<string>(
      'logPath',
      './logs',
    );

    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
    }

    const isProduction =
      this.customConfigService.getEnvVariable<string>('env') === 'production';

    const options: LoggerOptions = {
      level: isProduction ? 'warn' : 'debug',
      transport: {
        target: 'pino/file',
        options: {
          destination: path.join(logPath, 'app.log'),
        },
      },
    };

    this.logger = pino(options);
    this.info('Logger initialized');
  }

  debug(msg: string, context?: LogContext): void {
    this.logger.debug({ msg, ...context });
  }
  info(msg: string, context?: LogContext): void {
    this.logger.info({ msg, ...context });
  }
  warn(msg: string, context?: LogContext): void {
    this.logger.warn({ msg, ...context });
  }
  error(msg: string, trace: string, context?: LogContext): void {
    this.logger.error({ msg, trace, ...context });
  }
}
