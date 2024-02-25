import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { SecretManagerService } from 'src/internal-modules/external-handlers/secret-manager/secret-manager.service';
import { ICryptoService } from './interfaces/crypto.service.interface';

@Injectable()
export class CryptoService implements ICryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private key: Buffer;

  constructor(private readonly secretManager: SecretManagerService) {
    this.initializeKey();
  }

  private async initializeKey(): Promise<void> {
    try {
      const encryptionKey = '';
      this.key = Buffer.from(encryptionKey, 'base64');
    } catch (err) {
      console.error('Failed to load encryption key:', err);
      throw new Error('Failed to initialize crypto service');
    }
  }

  async encrypt(text: string): Promise<string> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const ivHex = iv.toString('hex');
    return `${ivHex}:${encrypted}`;
  }

  async decrypt(text: string): Promise<string> {
    const [ivHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async hash(text: string): Promise<string> {
    const normalizedText = text.trim().toLowerCase();
    const hash = createHash('sha256');
    hash.update(normalizedText);
    return hash.digest('hex');
  }
}
