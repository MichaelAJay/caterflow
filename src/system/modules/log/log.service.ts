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
  }

  private safelyLog(
    method: 'debug' | 'info' | 'warn' | 'error',
    msg: string,
    trace?: string,
    context?: LogContext,
  ) {
    try {
      const message = {
        msg,
        ...(typeof trace === 'string' ? { trace } : {}),
        ...context,
      };
      this.logger[method](message);
    } catch (err) {
      console.error('Logging failed', err);
    }
  }

  debug(msg: string, context?: LogContext): void {
    this.safelyLog('debug', msg, undefined, context);
  }
  info(msg: string, context?: LogContext): void {
    this.safelyLog('info', msg, undefined, context);
  }
  warn(msg: string, context?: LogContext): void {
    this.safelyLog('warn', msg, undefined, context);
  }
  error(msg: string, trace: string, context?: LogContext): void {
    this.safelyLog('error', msg, trace, context);
  }
}
