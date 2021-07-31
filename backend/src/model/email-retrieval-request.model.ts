import { Request } from 'express';
import { EMAIL_HEADER_RETRIEVAL_COUNT } from '../constants/email.constants';
import { ConnectionEncryption, ConnectionConfiguration, EmailServerType } from './connection.model';

/**
 * Data to be passed to EmailRetrievalRequest constructor
 */
interface EmailRetrievalRequestData {
  // Configuration for connecting to email server
  connectionOptions: ConnectionConfiguration;
  // Type of email server to retrieve from
  serverType: EmailServerType;
}

/**
 * Base data for all requests to retrieve email data i.e email headers or email body
 */
export class EmailRetrievalRequest {
  // Options for connecting to email server
  public connectionOptions: ConnectionConfiguration;
  // Type of email server to retrieve from
  public serverType: EmailServerType;

  constructor(data: EmailRetrievalRequestData) {
    this.connectionOptions = data?.connectionOptions ?? null;
    this.serverType = data?.serverType ?? null;
  }

  /**
   * Create EmailRetrievalRequest data from HTTP request body
   * @param {Request} req - HTTP Request payload
   */
  public static createFromHTTPRequest(req: Request): EmailRetrievalRequest {
    return new EmailRetrievalRequest({
      connectionOptions: {
        user: req?.body?.user as unknown as string,
        password: req?.body?.password as unknown as string,
        encryption: req?.body?.encryption as unknown as ConnectionEncryption,
      },
      serverType: req?.body?.serverType as unknown as EmailServerType,
    });
  }
}

/**
 * Data for requests to retrieve email headers
 * @extends EmailRetrievalRequest
 */
export class EmailHeaderRetrievalRequest extends EmailRetrievalRequest {
  // Number of emails' whose headers are to be retrieved
  public count: number;
  // Start range - position of email in the inbox to begin retrieving from
  public start: number;

  constructor(data: EmailRetrievalRequestData & { count?: number; start?: number }) {
    super(data);
    this.count = data?.count ?? EMAIL_HEADER_RETRIEVAL_COUNT;

    if (data?.start) {
      this.start = data.start;
    }
  }

  /**
   * Create EmailHeaderRetrievalRequest data from HTTP request body
   * @param {Request} req - HTTP Request payload
   */
  public static createFromHTTPRequest(req: Request): EmailHeaderRetrievalRequest {
    return new EmailHeaderRetrievalRequest({
      ...super.createFromHTTPRequest(req),
      count: req?.query?.count ? parseInt(req?.query?.count as string) : null,
      start: req?.query?.start ? parseInt(req?.query?.start as string) : null,
    });
  }
}

/**
 * Data for requests to retrieve email body
 * @extends EmailRetrievalRequest
 */
export class EmailBodyRetrievalRequest extends EmailRetrievalRequest {
  // Id of email whose body is to be retrieved
  public emailId: string;

  constructor(data: EmailRetrievalRequestData & { emailId: string }) {
    super(data);
    this.emailId = data?.emailId ?? '';
  }

  /**
   * Create EmailBodyRetrievalRequest data from HTTP request body
   * @param {Request} req - HTTP Request payload
   */
  public static createFromHTTPRequest(req: Request): EmailBodyRetrievalRequest {
    return new EmailBodyRetrievalRequest({
      ...super.createFromHTTPRequest(req),
      emailId: req?.params?.emailId,
    });
  }
}
