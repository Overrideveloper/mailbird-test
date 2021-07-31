import { ConnectionOptions } from 'tls';
import { EmailBody } from '../model/email-body.model';
import { EmailHeader } from '../model/email-header.model';

export interface BaseEmailClientConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: ConnectionOptions;
}

export interface EmailHeadersResponse {
  // List of retrieved email headers
  headerList: EmailHeader[];
  // Next retrieval request start range
  nextStartRange: number;
}

export abstract class BaseEmailClient {
  /**
   * Get email headers from the server
   * @param {number} count - Number of emails' headers to retrieve
   * @param {string} start - (optional) Start position in the inbox to begin retrieving from
   */
  public abstract getEmailHeaders(count: number, start?: number): Promise<EmailHeadersResponse>;

  /**
   * Get email body from the server
   * @param {string} id - id of email whose body is to be retrieved
   */
  public abstract getEmailBody(id: string): Promise<EmailBody>;
}
