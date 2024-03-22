import { Test, TestingModule } from '@nestjs/testing';
import { LOGGER_PROVIDER_INJECTION_TOKEN, LogService } from './log.service';
import pino from 'pino';

jest.mock('pino');
jest.mock('fs');

describe('LogService', () => {
  let service: LogService;
  let mockLogger: pino.Logger;

  beforeEach(async () => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as pino.Logger;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogService,
        { provide: LOGGER_PROVIDER_INJECTION_TOKEN, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<LogService>(LogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('debug', () => {
    it('should call the underlying logger with the correct message when no context is provided', () => {
      const testMessage = 'Test debug message';
      service.debug(testMessage);
      expect(mockLogger.debug).toHaveBeenCalledWith({ msg: testMessage });
    });

    it('should include additional context in the log if provided', () => {
      const testMessage = 'Test debug message with context';
      const testContext = { key: 'value' };
      service.debug(testMessage, testContext);
      expect(mockLogger.debug).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should handle an empty message string', () => {
      const testMessage = '';
      service.debug(testMessage);
      expect(mockLogger.debug).toHaveBeenCalledWith({ msg: testMessage });
    });

    it('should handle context with nested objects correctly', () => {
      const testMessage = 'Test message';
      const testContext = { nested: { key: 'value' } };
      service.debug(testMessage, testContext);
      expect(mockLogger.debug).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should not throw an error if context is null', () => {
      const testMessage = 'Test message with null context';
      expect(() =>
        service.debug(testMessage, null as unknown as Record<string, any>),
      ).not.toThrow();
    });

    it('should not throw an error if context is undefined', () => {
      const testMessage = 'Test message with undefined context';
      expect(() => service.debug(testMessage, undefined)).not.toThrow();
    });

    it('should handle context with array values correctly', () => {
      const testMessage = 'Test message with array context';
      const testContext = { array: [1, 2, 3] };
      service.debug(testMessage, testContext);
      expect(mockLogger.debug).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should handle complex objects in context correctly', () => {
      const testMessage = 'Test message with complex context';
      const testContext = { complex: new Date() };
      service.debug(testMessage, testContext);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({ msg: testMessage }),
      );
    });
  });
  describe('info', () => {
    it('should call the underlying logger with the correct message when no context is provided', () => {
      const testMessage = 'Test info message';
      service.info(testMessage);
      expect(mockLogger.info).toHaveBeenCalledWith({ msg: testMessage });
    });

    it('should include additional context in the log if provided', () => {
      const testMessage = 'Test info message with context';
      const testContext = { key: 'value' };
      service.info(testMessage, testContext);
      expect(mockLogger.info).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should handle an empty message string', () => {
      const testMessage = '';
      service.info(testMessage);
      expect(mockLogger.info).toHaveBeenCalledWith({ msg: testMessage });
    });

    it('should handle context with nested objects correctly', () => {
      const testMessage = 'Test message';
      const testContext = { nested: { key: 'value' } };
      service.info(testMessage, testContext);
      expect(mockLogger.info).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should not throw an error if context is null', () => {
      const testMessage = 'Test message with null context';
      expect(() =>
        service.info(testMessage, null as unknown as Record<string, any>),
      ).not.toThrow();
    });

    it('should not throw an error if context is undefined', () => {
      const testMessage = 'Test message with undefined context';
      expect(() => service.info(testMessage, undefined)).not.toThrow();
    });

    it('should handle context with array values correctly', () => {
      const testMessage = 'Test message with array context';
      const testContext = { array: [1, 2, 3] };
      service.info(testMessage, testContext);
      expect(mockLogger.info).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should handle complex objects in context correctly', () => {
      const testMessage = 'Test message with complex context';
      const testContext = { complex: new Date() };
      service.info(testMessage, testContext);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ msg: testMessage, ...testContext }),
      );
    });
  });
  describe('warn', () => {
    it('should call the underlying logger with the correct message when no context is provided', () => {
      const testMessage = 'Test warn message';
      service.warn(testMessage);
      expect(mockLogger.warn).toHaveBeenCalledWith({ msg: testMessage });
    });

    it('should include additional context in the log if provided', () => {
      const testMessage = 'Test warn message with context';
      const testContext = { key: 'value' };
      service.warn(testMessage, testContext);
      expect(mockLogger.warn).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should handle an empty message string', () => {
      const testMessage = '';
      service.warn(testMessage);
      expect(mockLogger.warn).toHaveBeenCalledWith({ msg: testMessage });
    });

    it('should handle context with nested objects correctly', () => {
      const testMessage = 'Test message';
      const testContext = { nested: { key: 'value' } };
      service.warn(testMessage, testContext);
      expect(mockLogger.warn).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should not throw an error if context is null', () => {
      const testMessage = 'Test message with null context';
      expect(() =>
        service.warn(testMessage, null as unknown as Record<string, any>),
      ).not.toThrow();
    });

    it('should not throw an error if context is undefined', () => {
      const testMessage = 'Test message with undefined context';
      expect(() => service.warn(testMessage, undefined)).not.toThrow();
    });

    it('should handle context with array values correctly', () => {
      const testMessage = 'Test message with array context';
      const testContext = { array: [1, 2, 3] };
      service.warn(testMessage, testContext);
      expect(mockLogger.warn).toHaveBeenCalledWith({
        msg: testMessage,
        ...testContext,
      });
    });

    it('should handle complex objects in context correctly', () => {
      const testMessage = 'Test message with complex context';
      const testContext = { complex: new Date() };
      service.warn(testMessage, testContext);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ msg: testMessage }),
      );
    });
  });
  describe('error', () => {
    it('should call the underlying logger with the correct message and trace when no context is provided', () => {
      const testMessage = 'Test error message';
      const testTrace = 'Test trace';
      service.error(testMessage, testTrace);
      expect(mockLogger.error).toHaveBeenCalledWith({
        msg: testMessage,
        trace: testTrace,
      });
    });

    it('should include additional context in the log if provided', () => {
      const testMessage = 'Test error message with context';
      const testTrace = 'Test trace';
      const testContext = { key: 'value' };
      service.error(testMessage, testTrace, testContext);
      expect(mockLogger.error).toHaveBeenCalledWith({
        msg: testMessage,
        trace: testTrace,
        ...testContext,
      });
    });

    it('should handle an empty message string', () => {
      const testMessage = '';
      const testTrace = 'Test trace';
      service.error(testMessage, testTrace);
      expect(mockLogger.error).toHaveBeenCalledWith({
        msg: testMessage,
        trace: testTrace,
      });
    });

    it('should handle an empty trace string', () => {
      const testMessage = 'Test message';
      const testTrace = '';
      service.error(testMessage, testTrace);
      expect(mockLogger.error).toHaveBeenCalledWith({
        msg: testMessage,
        trace: testTrace,
      });
    });

    it('should handle context with nested objects correctly', () => {
      const testMessage = 'Test message';
      const testTrace = 'Test trace';
      const testContext = { nested: { key: 'value' } };
      service.error(testMessage, testTrace, testContext);
      expect(mockLogger.error).toHaveBeenCalledWith({
        msg: testMessage,
        trace: testTrace,
        ...testContext,
      });
    });

    it('should not throw an error if context is null', () => {
      const testMessage = 'Test message with null context';
      const testTrace = 'Test trace';
      expect(() =>
        service.error(
          testMessage,
          testTrace,
          null as unknown as Record<string, any>,
        ),
      ).not.toThrow();
    });

    it('should not throw an error if context is undefined', () => {
      const testMessage = 'Test message with undefined context';
      const testTrace = 'Test trace';
      expect(() =>
        service.error(testMessage, testTrace, undefined),
      ).not.toThrow();
    });

    it('should handle context with array values correctly', () => {
      const testMessage = 'Test message with array context';
      const testTrace = 'Test trace';
      const testContext = { array: [1, 2, 3] };
      service.error(testMessage, testTrace, testContext);
      expect(mockLogger.error).toHaveBeenCalledWith({
        msg: testMessage,
        trace: testTrace,
        ...testContext,
      });
    });

    it('should handle complex objects in context correctly', () => {
      const testMessage = 'Test message with complex context';
      const testTrace = 'Test trace';
      const testContext = { complex: new Date() };
      service.error(testMessage, testTrace, testContext);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ msg: testMessage, trace: testTrace }),
      );
    });
  });
});
