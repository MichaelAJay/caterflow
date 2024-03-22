import { Inject, Injectable } from '@nestjs/common';
import { ILogService } from './interfaces/log.service.interface';
import pino from 'pino';

export const LOGGER_PROVIDER_INJECTION_TOKEN = 'LOGGER_PROVIDER';

type LogContext = Record<string, any>;

@Injectable()
export class LogService implements ILogService {
  private logger: pino.Logger;

  constructor(@Inject(LOGGER_PROVIDER_INJECTION_TOKEN) logger: pino.Logger) {
    this.logger = logger;
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
