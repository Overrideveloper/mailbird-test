import { StatusCodes } from 'http-status-codes';

/**
 * Base class for all [custom] errors to be generated in the system.
 */
export class CustomError {
  // Error data
  public data: any;
  // Error message
  public message = 'Internal Server Error';
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
  public message = 'Authentication Error: Invalid credentials provided';
  public code = StatusCodes.UNAUTHORIZED;
}

/**
 * System-generated validation error
 */
export class BadRequestError extends CustomError {
  public message = 'Bad Request: Invalid data provided';
  public code = StatusCodes.BAD_REQUEST;
}

/**
 * System-generated gateway timeout error
 */
export class GatewayTimeoutError extends CustomError {
  public message = 'Gateway Timeout';
  public code = StatusCodes.GATEWAY_TIMEOUT;
}

/**
 * System-generated not found error
 */
export class NotFoundError extends CustomError {
  public message = 'Not Found';
  public code = StatusCodes.NOT_FOUND;

  constructor(message: string, data: any) {
    super(data);
    this.message = message;
  }
}

/**
 * System-generated internal server error
 */
export class InternalServerError extends CustomError {}
