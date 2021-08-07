import { EmailBody } from '../model/email/email-body.model';
import { EmailHeader } from '../model/email/email-header.model';
import { AuthenticationError, CustomError, GatewayTimeoutError, InternalServerError } from '../model/error.model';

/**
 * Configuration to be provided when instantiating an email client.
 */
export interface BaseEmailClientConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  starttls?: boolean;
}

/**
 * Response structure of email headers payload
 */
export interface EmailHeadersResponse {
  // List of retrieved email headers
  headerList: EmailHeader[];
  // Next retrieval request start range
  nextStartRange: number;
}

/**
 * Base email client.
 *
 * Defines a framework for all derivative email clients to follow
 */
export abstract class BaseEmailClient {
  /**
   * Get email headers from the server
   * @param {number} count - Number of emails' headers to retrieve
   * @param {string} start - (optional) Start position in the inbox to begin retrieving from
   */
  public abstract getEmailHeaders(count: number, start?: number): Promise<EmailHeadersResponse>;

  /**
   * Get email body from the server
   * @param {number|string} id - id of email whose body is to be retrieved
   */
  public abstract getEmailBody(id: number | string): Promise<EmailBody>;

  /**
   * Compute the range of emails to retrieve from the server
   * @param {number} totalInboxCount - Total number of emails in the inbox
   * @param {number} count - Number of emails' headers to retrieve
   * @param {number} start - (optional) Start position in the inbox to begin retrieving from
   *
   * Returns:
   * - startRange: Position in the inbox to begin retrieving from
   * - endRange: Position in the inbox to stop retrieving at
   * - nextStartRange: Position in the inbox to begin retrieving from next time i.e position after the end range
   */
  protected computeRetrievalRange(
    totalInboxCount: number,
    count: number,
    start?: number,
  ): {
    startRange: number;
    endRange: number;
    nextStartRange: number;
  } {
    // Calculate the start and end range of emails' headers to retrieve
    // If start range is not provided, start from the last email in the inbox
    const startRange = start ?? totalInboxCount;

    // Calculate end range
    let endRange = startRange - count + 1;
    // If calculated endRange is less than 1 i.e the first email in the inbox, default to the first email in the inbox;
    endRange = endRange < 1 ? 1 : endRange;

    // Compute next retrieval request start range i.e position after the end range
    // If endRange is 1 i.e the first email in the inbox, set nextStartRange to null, else set nextStartRange to endRange - 1
    const nextStartRange = endRange === 1 ? null : endRange - 1;

    return {
      startRange,
      endRange,
      nextStartRange,
    };
  }

  /**
   * Convert client-generated errors to a specific type of CustomError depending on the nature of the error
   * @param {any} error - Client-generated error
   */
  protected parseError(error: any): CustomError {
    // If error is already a custom error, return it
    if (error instanceof CustomError) {
      return error;
    }
    // If error source is authentication, return an AuthenticationError
    if (error?.source?.toLowerCase() === 'authentication') {
      return new AuthenticationError(error);
    }
    // If error source is timeout, return a GatewayTimeoutError
    if (error?.source?.toLowerCase() === 'timeout' || error?.code === 'ETIMEDOUT') {
      return new GatewayTimeoutError(error);
    }
    // Else return error as an internal server error
    return new InternalServerError(error);
  }
}
