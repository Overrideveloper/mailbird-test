import { EmailBody } from '../model/email/email-body.model';
import { EmailHeader } from '../model/email/email-header.model';

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
   * @param {number} id - id of email whose body is to be retrieved
   */
  public abstract getEmailBody(id: number): Promise<EmailBody>;

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
  protected computeRetrievalRange(totalInboxCount: number, count: number, start?: number): {
    startRange: number;
    endRange: number;
    nextStartRange: number;
  } {
    // Compute the start and end range of emails' headers to retrieve
    // If start range is not provided, start from the last email in the inbox
    const startRange = start ?? totalInboxCount;
    // If endRange is less than the first email in the inbox, default to the first email in the inbox;
    const endRange = (startRange - count + 1) ?? 1;
    // Next retrieval request start range i.e position after the end range
    const nextStartRange = endRange - 1;

    return {
      startRange,
      endRange,
      nextStartRange
    }
  }
}
