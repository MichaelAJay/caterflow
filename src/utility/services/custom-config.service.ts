import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  constructor(private readonly configService: ConfigService) {}

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
