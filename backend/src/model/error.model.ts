import { StatusCodes } from 'http-status-codes';

/**
 * Base class for all [custom] errors to be generated in the system.
 */
export class CustomError {
  // Error data
  public data: any;
  // Error HTTP code. Defaults to 500.
  public code = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(data: any) {
    this.data = data;
  }
}

/**
 * System-generated authentication error
 */
export class AuthenticationError extends CustomError {
  public code = StatusCodes.UNAUTHORIZED;
}

/**
 * System-generated validation error
 */
export class BadRequestError extends CustomError {
  public code = StatusCodes.BAD_REQUEST;
}

/**
 * System-generated internal server error
 */
export class InternalServerError extends CustomError {}
