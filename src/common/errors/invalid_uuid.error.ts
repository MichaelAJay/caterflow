export class InvalidUUIDError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUUIDError';
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidUUIDError);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
