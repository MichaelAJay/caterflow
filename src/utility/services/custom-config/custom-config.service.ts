import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICustomConfigService } from './interfaces/custom-config.service.interface';

@Injectable()
export class CustomConfigService implements ICustomConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * If defaultValue is not provided and environment variable is not found, throws error
   * @param key
   * @param [defaultValue]
   * @returns
   */
  getEnvVariable<T>(key: string, defaultValue?: T): T {
    const value = this.configService.get<T>(key);

    if (value !== undefined) {
      return value;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    // If (value and defaultValue are undefined, throw)
    throw new Error(`Environment variable ${key} is not defined`);
  }
}
