import { ActionLoggingInterceptor } from './action-logging.interceptor';
import { TestingModule, Test } from '@nestjs/testing';
import { UserSystemActionDbHandlerService } from '../../../internal-modules/external-handlers/db-handlers/user-system-action-db-handler/user-system-action-db-handler.service';
import { mockUserSystemActionDbHandler } from '../../../../test/mocks/providers/mock_user_system_action_db_handler';

describe('ActionLoggingInterceptor', () => {
  let interceptor: ActionLoggingInterceptor;
  let userSystemActionDbHandler: UserSystemActionDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionLoggingInterceptor,
        {
          provide: UserSystemActionDbHandlerService,
          useValue: mockUserSystemActionDbHandler,
        },
      ],
    }).compile();

    interceptor = module.get<ActionLoggingInterceptor>(
      ActionLoggingInterceptor,
    );
    userSystemActionDbHandler = module.get<UserSystemActionDbHandlerService>(
      UserSystemActionDbHandlerService,
    );
  });

  it('should be defined with all dependencies injected', () => {
    expect(interceptor).toBeDefined();
    expect(userSystemActionDbHandler).toBeDefined();
  });
});
