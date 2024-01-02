export const AUTHENTICATION_ERROR_NAME = 'AuthenticationError';

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = AUTHENTICATION_ERROR_NAME;
  }
}
