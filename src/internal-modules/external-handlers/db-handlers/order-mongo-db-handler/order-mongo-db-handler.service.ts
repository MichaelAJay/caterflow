import { Injectable } from '@nestjs/common';
import { MongoClientService } from '../../../../external-modules/mongo-client/mongo-client.service';
import { COLLECTION_NAMES } from '../../../../external-modules/mongo-client/constants/collection-names.constant';
import { ObjectId } from 'mongodb';

type TestType = {
  name: string;
  ezCaterId: string;
};

@Injectable()
export class OrderMongoDbHandlerService {
  constructor(private readonly mongoDbClient: MongoClientService) {}

  async findOrderById(orderId: string) {
    return this.mongoDbClient.runQuery((db) =>
      db
        .collection(COLLECTION_NAMES.Order)
        .findOne({ _id: new ObjectId(orderId) }),
    );
  }

  async createOrder(data: any) {
    const answer = await this.mongoDbClient.runQuery((db) =>
      db.collection<TestType>(COLLECTION_NAMES.Order).insertOne(data),
    );
    return answer;
  }

  /**
   * Example of how to use runTransaction
   */
  //   async processOrderTransaction(data: any) {
  //     const result = await this.mongoDbClient.runTransaction([
  //       async (session, db) => {
  //         await db
  //           .collection(COLLECTION_NAMES.Order)
  //           .insertOne(data, { session });
  //       },
  //     ]);
  //     return result;
  //   }
}
