import { ActionLoggingInterceptor } from './action-logging.interceptor';
import { TestingModule, Test } from '@nestjs/testing';
import { UserSystemActionDbHandlerService } from '../../../internal-modules/external-handlers/db-handlers/user-system-action-db-handler/user-system-action-db-handler.service';
import { mockUserSystemActionDbHandler } from '../../../../test/mocks/providers/mock_user_system_action_db_handler';
import { LogService } from '../../../system/modules/log/log.service';
import { mockLogService } from '../../../../test/mocks/providers/mock_log_service';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import actionLoggingUtilities from './utilities/action-logging-utilities';
import { IBuildCreateUserSystemActionArgs } from '../../../internal-modules/external-handlers/db-handlers/user-system-action-db-handler/interfaces/query-builder-args.interface';
import { AuthenticatedRequest } from '../../../api/interfaces/authenticated-request.interface';

jest.mock('./utilities/action-logging-utilities');

/** Mocking rxjs is not working for me */
// jest.mock('rxjs', () => ({
//   of: jest.fn().mockImplementation((value) => ({
//     pipe: jest.fn().mockReturnThis(),
//     subscribe: jest.fn().mockImplementation((callback) => {
//       if (typeof callback === 'function') {
//         callback(value);
//       }
//       return {
//         unsubscribe: jest.fn(),
//       };
//     }),
//   })),
//   throwError: jest.fn().mockImplementation((errorFactory) => ({
//     pipe: jest.fn().mockReturnThis(),
//     subscribe: jest.fn().mockImplementation((_, errorCallback) => {
//       errorCallback(errorFactory());
//       return {
//         unsubscribe: jest.fn(),
//       };
//     }),
//   })),
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   tap: jest.fn().mockImplementation((callback) => ({
//     pipe: jest.fn().mockReturnThis(),
//   })),
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   catchError: jest.fn().mockImplementation((callback) => ({
//     pipe: jest.fn().mockReturnThis(),
//   })),
// }));

describe('ActionLoggingInterceptor', () => {
  let interceptor: ActionLoggingInterceptor;
  let userSystemActionDbHandler: UserSystemActionDbHandlerService;
  let logService: LogService;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: AuthenticatedRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionLoggingInterceptor,
        {
          provide: UserSystemActionDbHandlerService,
          useValue: mockUserSystemActionDbHandler,
        },
        { provide: LogService, useValue: mockLogService },
      ],
    }).compile();

    interceptor = module.get<ActionLoggingInterceptor>(
      ActionLoggingInterceptor,
    );
    userSystemActionDbHandler = module.get<UserSystemActionDbHandlerService>(
      UserSystemActionDbHandlerService,
    );
    logService = module.get<LogService>(LogService);

    mockRequest = {
      raw: {
        method: 'POST',
        url: 'http://localhost/integration/create-from',
      },
      user: {
        id: 'user123',
        companyId: 'company456',
      },
    } as unknown as AuthenticatedRequest;

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as unknown as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler;

    actionLoggingUtilities.buildSystemActionsForDb = jest.fn();
    actionLoggingUtilities.buildErrorContextForLog = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined with all dependencies injected', () => {
    expect(interceptor).toBeDefined();
    expect(userSystemActionDbHandler).toBeDefined();
    expect(logService).toBeDefined();
  });

  /**
   * As of 8 April 2024, I have to set aside trying to test this method - I can't get it figured out
   */
  // describe('intercept', () => {
  //   it('should log user action with SUCCESS result when request succeeds', (done) => {
  //     const mockResponse = { data: 'success' };
  //     jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(mockResponse));
  //     jest.spyOn(interceptor, 'logUserAction').mockImplementation(() => {});

  //     interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
  //       next: (response) => {
  //         expect(response).toEqual(mockResponse);
  //         expect(interceptor.logUserAction).toHaveBeenCalledWith(
  //           mockExecutionContext,
  //           $Enums.SystemActionResult.SUCCESS,
  //         );
  //         done();
  //       },
  //     });
  //   });

  //   it('should log user action with ERROR result when request fails', (done) => {
  //     const mockError = new Error('Request failed');
  //     jest
  //       .spyOn(mockCallHandler, 'handle')
  //       .mockReturnValue(throwError(() => mockError));
  //     jest.spyOn(interceptor, 'logUserAction');

  //     interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
  //       error: (error) => {
  //         expect(error).toEqual(mockError);
  //         expect(interceptor.logUserAction).toHaveBeenCalledWith(
  //           mockExecutionContext,
  //           $Enums.SystemActionResult.ERROR,
  //         );
  //         done();
  //       },
  //     });
  //   });

  //   it('should pass through the error when request fails', (done) => {
  //     const mockError = new Error('Request failed');
  //     jest
  //       .spyOn(mockCallHandler, 'handle')
  //       .mockReturnValue(throwError(() => mockError));

  //     interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
  //       error: (error) => {
  //         expect(error).toEqual(mockError);
  //         done();
  //       },
  //     });
  //   });

  //   it('should call logUserAction with the correct arguments', (done) => {
  //     const mockResponse = { data: 'success' };
  //     jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(mockResponse));
  //     jest.spyOn(interceptor, 'logUserAction');

  //     interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
  //       complete: () => {
  //         expect(interceptor.logUserAction).toHaveBeenCalledWith(
  //           mockExecutionContext,
  //           $Enums.SystemActionResult.SUCCESS,
  //         );
  //         done();
  //       },
  //     });
  //   });
  // });
  describe('logUserAction', () => {
    it('should build system actions for DB and execute DB operation when createArgs is not empty', () => {
      const actionResult = $Enums.SystemActionResult.SUCCESS;
      const createArg1: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'AddIntegrationAsset',
        result: 'SUCCESS',
      };
      const createArg2: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'UpdateIntegration',
        result: 'SUCCESS',
      };
      const createArgs: IBuildCreateUserSystemActionArgs[] = [
        createArg1,
        createArg2,
      ];

      jest
        .spyOn(actionLoggingUtilities, 'buildSystemActionsForDb')
        .mockReturnValue(createArgs);

      jest.spyOn(interceptor, 'executeDbOperation').mockReturnValue();

      interceptor.logUserAction(mockExecutionContext, actionResult);

      expect(
        actionLoggingUtilities.buildSystemActionsForDb,
      ).toHaveBeenCalledWith(mockRequest, actionResult);
      expect(interceptor.executeDbOperation).toHaveBeenCalledWith(
        createArgs,
        mockRequest,
      );
      expect(logService.warn).not.toHaveBeenCalled();
    });

    it('should not execute DB operation when createArgs is empty', () => {
      const actionResult = $Enums.SystemActionResult.SUCCESS;
      const createArgs: any[] = [];

      jest
        .spyOn(actionLoggingUtilities, 'buildSystemActionsForDb')
        .mockReturnValue(createArgs);

      jest.spyOn(interceptor, 'executeDbOperation');

      interceptor.logUserAction(mockExecutionContext, actionResult);

      expect(
        actionLoggingUtilities.buildSystemActionsForDb,
      ).toHaveBeenCalledWith(mockRequest, actionResult);
      expect(interceptor.executeDbOperation).not.toHaveBeenCalled();
      expect(logService.warn).not.toHaveBeenCalled();
    });

    it('should log a warning when an error occurs', () => {
      const actionResult = $Enums.SystemActionResult.SUCCESS;
      const errorMessage = 'An error occurred';
      const logContext = {
        sample: 'context',
      };

      jest
        .spyOn(actionLoggingUtilities, 'buildSystemActionsForDb')
        .mockImplementation(() => {
          throw new Error(errorMessage);
        });
      jest
        .spyOn(actionLoggingUtilities, 'buildErrorContextForLog')
        .mockReturnValue(logContext);

      jest.spyOn(interceptor, 'executeDbOperation');

      interceptor.logUserAction(mockExecutionContext, actionResult);

      expect(
        actionLoggingUtilities.buildSystemActionsForDb,
      ).toHaveBeenCalledWith(mockRequest, actionResult);
      expect(interceptor.executeDbOperation).not.toHaveBeenCalled();
      expect(
        actionLoggingUtilities.buildErrorContextForLog,
      ).toHaveBeenCalledWith(mockRequest);
      expect(logService.warn).toHaveBeenCalledWith(errorMessage, logContext);
    });
  });

  describe('executeDbOperation', () => {
    it('should call userSystemActionDbHandler.create when createArgs length is 1', async () => {
      const createArg1: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'AddIntegrationAsset',
        result: 'SUCCESS',
      };

      const createArgs: IBuildCreateUserSystemActionArgs[] = [createArg1];
      const createSpy = jest
        .spyOn(userSystemActionDbHandler, 'create')
        .mockResolvedValue({} as any);

      interceptor.executeDbOperation(createArgs, mockRequest);

      expect(createSpy).toHaveBeenCalledWith(createArgs[0]);
    });

    it('should call userSystemActionDbHandler.createMany when createArgs length is greater than 1', async () => {
      const createArg1: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'AddIntegrationAsset',
        result: 'SUCCESS',
      };
      const createArg2: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'UpdateIntegration',
        result: 'SUCCESS',
      };
      const createArgs: IBuildCreateUserSystemActionArgs[] = [
        createArg1,
        createArg2,
      ];
      const createManySpy = jest
        .spyOn(userSystemActionDbHandler, 'createMany')
        .mockResolvedValue({} as any);

      interceptor.executeDbOperation(createArgs, mockRequest);

      expect(createManySpy).toHaveBeenCalledWith(createArgs);
    });

    it('should log a warning when userSystemActionDbHandler.create throws an error', async () => {
      const createArg1: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'AddIntegrationAsset',
        result: 'SUCCESS',
      };
      const createArgs: IBuildCreateUserSystemActionArgs[] = [createArg1];
      const errorMessage = 'Error creating user system action';
      const errorContext = {
        /* mock error context */
      };
      jest
        .spyOn(userSystemActionDbHandler, 'create')
        .mockRejectedValue(new Error(errorMessage));
      jest
        .spyOn(actionLoggingUtilities, 'buildErrorContextForLog')
        .mockReturnValue(errorContext);

      interceptor.executeDbOperation(createArgs, mockRequest);

      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for the next tick

      expect(logService.warn).toHaveBeenCalledWith(errorMessage, errorContext);
    });

    it('should log a warning when userSystemActionDbHandler.createMany throws an error', async () => {
      const createArg1: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'AddIntegrationAsset',
        result: 'SUCCESS',
      };
      const createArg2: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'UpdateIntegration',
        result: 'SUCCESS',
      };
      const createArgs: IBuildCreateUserSystemActionArgs[] = [
        createArg1,
        createArg2,
      ];
      const errorMessage = 'Error creating multiple user system actions';
      const errorContext = {
        /* mock error context */
      };
      jest
        .spyOn(userSystemActionDbHandler, 'createMany')
        .mockRejectedValue(new Error(errorMessage));
      jest
        .spyOn(actionLoggingUtilities, 'buildErrorContextForLog')
        .mockReturnValue(errorContext);

      interceptor.executeDbOperation(createArgs, mockRequest);

      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for the next tick

      expect(logService.warn).toHaveBeenCalledWith(errorMessage, errorContext);
    });

    it('should not log a warning when userSystemActionDbHandler.create succeeds', async () => {
      const createArg1: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'AddIntegrationAsset',
        result: 'SUCCESS',
      };
      const createArgs: IBuildCreateUserSystemActionArgs[] = [createArg1];
      jest
        .spyOn(userSystemActionDbHandler, 'create')
        .mockResolvedValue(undefined);

      interceptor.executeDbOperation(createArgs, mockRequest);

      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for the next tick

      expect(logService.warn).not.toHaveBeenCalled();
    });

    it('should not log a warning when userSystemActionDbHandler.createMany succeeds', async () => {
      const createArg1: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'AddIntegrationAsset',
        result: 'SUCCESS',
      };
      const createArg2: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'UpdateIntegration',
        result: 'SUCCESS',
      };
      const createArgs: IBuildCreateUserSystemActionArgs[] = [
        createArg1,
        createArg2,
      ];
      jest
        .spyOn(userSystemActionDbHandler, 'createMany')
        .mockResolvedValue(undefined);

      interceptor.executeDbOperation(createArgs, mockRequest);

      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for the next tick

      expect(logService.warn).not.toHaveBeenCalled();
    });

    it('should call actionLoggingUtilities.buildErrorContextForLog with the request when an error occurs', async () => {
      const createArg1: IBuildCreateUserSystemActionArgs = {
        userId: '123',
        action: 'AddIntegrationAsset',
        result: 'SUCCESS',
      };
      const createArgs: IBuildCreateUserSystemActionArgs[] = [createArg1];
      jest
        .spyOn(userSystemActionDbHandler, 'create')
        .mockRejectedValue(new Error());

      jest
        .spyOn(actionLoggingUtilities, 'buildErrorContextForLog')
        .mockReturnValue({});

      interceptor.executeDbOperation(createArgs, mockRequest);

      // Hack (sorry)
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for the next tick

      expect(
        actionLoggingUtilities.buildErrorContextForLog,
      ).toHaveBeenCalledWith(mockRequest);
    });
  });
});
