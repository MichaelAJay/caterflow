import { $Enums, SystemAction } from '@prisma/client';
import { AuthenticatedRequest } from '../../../../api/interfaces/authenticated-request.interface';
import actionLoggingUtilities from './action-logging-utilities';

// Mock data
const mockRequest: AuthenticatedRequest = {
  raw: {
    method: 'POST',
    url: 'http://localhost/integration/create-from',
  },
  user: {
    id: 'user123',
    companyId: 'company456',
  },
} as unknown as AuthenticatedRequest;

const mockResult: $Enums.SystemActionResult = 'SUCCESS';

describe('actionLoggingUtilities', () => {
  describe('buildSystemActionsForDb', () => {
    it('should build system actions for DB based on the request and result', () => {
      const result = actionLoggingUtilities.buildSystemActionsForDb(
        mockRequest,
        mockResult,
      );

      expect(result).toEqual([
        {
          userId: 'user123',
          companyId: 'company456',
          action: 'AddIntegrationAsset',
          result: $Enums.SystemActionResult.SUCCESS,
        },
        {
          userId: 'user123',
          companyId: 'company456',
          action: 'UpdateIntegration',
          result: $Enums.SystemActionResult.SUCCESS,
        },
      ]);
    });

    it('should return an empty array if the route is not mapped', () => {
      const invalidRequest: AuthenticatedRequest = {
        raw: {
          method: 'GET',
          url: 'http://localhost/invalid-route',
        },
        user: {
          id: 'user123',
          companyId: 'company456',
        },
      } as unknown as AuthenticatedRequest;

      const result = actionLoggingUtilities.buildSystemActionsForDb(
        invalidRequest,
        mockResult,
      );

      expect(result).toEqual([]);
    });

    it('should throw an error if the request object is missing method or url', () => {
      const invalidRequest: AuthenticatedRequest = {
        raw: {},
        user: {
          id: 'user123',
          companyId: 'company456',
        },
      } as unknown as AuthenticatedRequest;

      expect(() =>
        actionLoggingUtilities.buildSystemActionsForDb(
          invalidRequest,
          mockResult,
        ),
      ).toThrow('Request object could not parse method and url');
    });

    it('should throw an error if the request object is missing user details', () => {
      const invalidRequest: AuthenticatedRequest = {
        raw: {
          method: 'POST',
          url: 'http://localhost/integration/create-from',
        },
        user: {},
      } as unknown as AuthenticatedRequest;

      expect(() =>
        actionLoggingUtilities.buildSystemActionsForDb(
          invalidRequest,
          mockResult,
        ),
      ).toThrow('Request body is missing user, user id, or company id');
    });
  });

  describe('buildErrorContextForLog', () => {
    it('should build error context for logging', () => {
      const result =
        actionLoggingUtilities.buildErrorContextForLog(mockRequest);

      expect(result).toEqual({
        method: 'post',
        pathname: '/integration/create-from',
        userId: 'user123',
        companyId: 'company456',
      });
    });

    it('should throw an error if the request object is missing method or url', () => {
      const invalidRequest: AuthenticatedRequest = {
        raw: {},
        user: {
          id: 'user123',
          companyId: 'company456',
        },
      } as unknown as AuthenticatedRequest;

      expect(() =>
        actionLoggingUtilities.buildErrorContextForLog(invalidRequest),
      ).toThrow('Request object could not parse method and url');
    });

    it('should throw an error if the request object is missing user details', () => {
      const invalidRequest: AuthenticatedRequest = {
        raw: {
          method: 'POST',
          url: 'http://localhost/integration/create-from',
        },
        user: {},
      } as unknown as AuthenticatedRequest;

      expect(() =>
        actionLoggingUtilities.buildErrorContextForLog(invalidRequest),
      ).toThrow('Request body is missing user, user id, or company id');
    });
  });
});

// Integration tests
describe('actionLoggingUtilities integration', () => {
  it('should build system actions and error context correctly', () => {
    const systemActions = actionLoggingUtilities.buildSystemActionsForDb(
      mockRequest,
      mockResult,
    );
    const errorContext =
      actionLoggingUtilities.buildErrorContextForLog(mockRequest);

    expect(systemActions).toEqual([
      {
        userId: 'user123',
        companyId: 'company456',
        action: 'AddIntegrationAsset',
        result: $Enums.SystemActionResult.SUCCESS,
      },
      {
        userId: 'user123',
        companyId: 'company456',
        action: 'UpdateIntegration',
        result: $Enums.SystemActionResult.SUCCESS,
      },
    ]);

    expect(errorContext).toEqual({
      method: 'post',
      pathname: '/integration/create-from',
      userId: 'user123',
      companyId: 'company456',
    });
  });

  it('should throw an error if the request object is missing required data', () => {
    const invalidRequest: AuthenticatedRequest = {
      raw: {},
      user: {},
    } as unknown as AuthenticatedRequest;

    expect(() =>
      actionLoggingUtilities.buildSystemActionsForDb(
        invalidRequest,
        mockResult,
      ),
    ).toThrow('Request object could not parse method and url');

    expect(() =>
      actionLoggingUtilities.buildErrorContextForLog(invalidRequest),
    ).toThrow('Request object could not parse method and url');
  });
});
