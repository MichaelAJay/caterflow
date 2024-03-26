import { Injectable } from '@nestjs/common';
import { IUserSystemActionDbHandler } from './interfaces/user-system-action-db-handler.service.interface';

@Injectable()
export class UserSystemActionDbHandlerService
  implements IUserSystemActionDbHandler {}
