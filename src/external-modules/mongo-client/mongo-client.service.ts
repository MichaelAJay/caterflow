import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientSession, Db, MongoClient } from 'mongodb';
import { SecretManagerService } from 'src/internal-modules/external-handlers/secret-manager/secret-manager.service';

@Injectable()
export class MongoClientService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private dbConnection: Db;

  constructor(private readonly secretManager: SecretManagerService) {}

  async onModuleInit() {
    const systemSecretName = this.secretManager.getSystemSecretName(
      'MONGODB_CONNECTION_URI',
    );
    const uri = await this.secretManager.getSecret(systemSecretName);
    this.client = new MongoClient(uri);

    await this.client.connect();
    console.log('MongoDB connection established');
    this.dbConnection = this.client.db('caterflow');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    }
  }

  async runQuery<T>(operation: (db: Db) => Promise<T>): Promise<T> {
    try {
      return await operation(this.dbConnection);
    } catch (err) {
      console.error('Error running query:', err);
      throw err;
    }
  }

  async runTransaction(
    operations: ((session: ClientSession, db: Db) => Promise<void>)[],
  ): Promise<void> {
    const session = this.client.startSession();
    try {
      session.startTransaction();
      for (const operation of operations) {
        await operation(session, this.dbConnection);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}
