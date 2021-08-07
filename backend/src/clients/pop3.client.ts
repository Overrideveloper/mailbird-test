import pEvent from 'p-event';
import POP3Client, { Config } from 'poplib';
import { simpleParser } from 'mailparser';
import { AuthenticationError, InternalServerError, NotFoundError } from '../model/error.model';
import { EmailBody } from '../model/email/email-body.model';
import { EmailHeader } from '../model/email/email-header.model';
import { BaseEmailClient, BaseEmailClientConfig, EmailHeadersResponse } from './base.client';

/**
 * Email client that uses the POP3 protocol
 */
export class POP3EmailClient extends BaseEmailClient {
  private pop3Client: POP3Client;

  constructor(private config: BaseEmailClientConfig) {
    super();
  }

  /**
   * Set up the POP3 client
   */
  private init(): void {
    let config: Config = {
      enabletls: false,
      ignoretlserrs: true,
      debug: false,
    };

    if (this.config.tls) {
      config.enabletls = true;
    }

    this.pop3Client = new POP3Client(this.config.port, this.config.host, config);
  }

  /**
   * Connect to the POP3 server
   */
  private async connect(): Promise<void> {
    // Initialize the POP3 client. This will initiate a connection to the server
    this.init();

    // Await the completion of the connect operation
    const [connectStatus, connectStatusMessage] = await pEvent<string, [boolean, string]>(this.pop3Client, 'connect', {
      multiArgs: true,
    });

    // Connection failed
    if (!connectStatus) {
      throw new InternalServerError(connectStatusMessage);
    }

    // Connection succeeded
    // STLS/STARTTLS is not required in config, resolve the promise
    if (!this.config.starttls) {
      return;
    }

    // STLS/STARTTLSS is required in config
    // Check if the server supports STLS
    this.pop3Client.capa();

    // Await the completion of the STLS operation
    const [capaStatus, capaList] = await pEvent<string, [boolean, string[], string]>(this.pop3Client, 'capa', {
      multiArgs: true,
    });

    // CAPA failed
    // Fallback to using default connection
    if (!capaStatus) {
      return;
    }

    // CAPA succeeded, but STLS is not supported
    // Fallback to using default connection
    if (!capaList.includes('STLS')) {
      return;
    }

    // STLS is supported, initiate the STLS operation
    this.pop3Client.stls();

    // Await the completion of the STLS operation
    const [stlsStatus, stlsStatusMessage] = await pEvent<string, [boolean, string]>(this.pop3Client, 'stls', {
      multiArgs: true,
    });

    // STLS operation failed
    // Reject the promise
    if (!stlsStatus) {
      throw new InternalServerError(stlsStatusMessage);
    }

    // STLS operation succeeded
    // Resolve the promise
    return;
  }

  /**
   * Log in to the POP3 server
   */
  private async login(): Promise<void> {
    this.pop3Client.login(this.config.user, this.config.password);

    // Await the completion of the login operation
    const [loginStatus, loginStatusMessage] = await pEvent<string, [boolean, string]>(this.pop3Client, 'login', {
      multiArgs: true,
    });

    // Login failed
    // Reject the promise with authentication error
    if (!loginStatus) {
      throw new AuthenticationError(loginStatusMessage);
    }

    // Login succeeded
    // Resolve the promise
    return;
  }

  /**
   * Given an email number, retrieve its header and UIDL
   * @param {number} emailNumber - Email number to retrieve
   */
  private async getHeadersAndUID(emailNumber: number): Promise<EmailHeader> {
    // Retrieve the email headers
    this.pop3Client.top(emailNumber, 0);
    // Await the completion of top operation
    const [topStatus, _, header, topStatusMessage] = await pEvent<string, [boolean, number, string, string]>(
      this.pop3Client,
      'top',
      { multiArgs: true },
    );

    // TOP operation failed
    // Throw error
    if (!topStatus) {
      throw new InternalServerError(topStatusMessage);
    }

    // Retrieve the email UID
    this.pop3Client.uidl(emailNumber);
    // Await the completion of uidl operation
    const [uidlStatus, __, uidlList, uidlStatusMessage] = await pEvent<string, [boolean, number, string[], string]>(
      this.pop3Client,
      'uidl',
      { multiArgs: true },
    );

    // UIDL operation failed
    // Throw error
    if (!uidlStatus) {
      throw new InternalServerError(uidlStatusMessage);
    }

    // Top and UIDL operation succeeded
    // Return parsed header
    return simpleParser(header).then((parsedHeader) =>
      EmailHeader.createFromParsedMailAndEmailId(parsedHeader, uidlList[emailNumber]),
    );
  }

  /**
   * Given an email UID, get its number
   * @param {string} uid - UID of the email
   */
  private async getEmailNumber(emailUID: string): Promise<number> {
    // Retrieve the UIDL
    this.pop3Client.uidl();
    // Await the completion of UIDL operation
    const [uidlStatus, _, uidlList, uidlStatusMessage] = await pEvent<string, [boolean, number, string[], string]>(
      this.pop3Client,
      'uidl',
      { multiArgs: true },
    );

    // UIDL operation failed
    // Throw error
    if (!uidlStatus) {
      throw new InternalServerError(uidlStatusMessage);
    }

    // UIDL operation succeeded
    // Get email number from UIDL
    const emailNumber = uidlList.findIndex((uid) => uid === emailUID);

    // Email number is invalid (less than 1)
    // Throw error
    if (emailNumber < 1) {
      throw new NotFoundError('Email not found', {});
    }

    // Email number is valid
    // Resolve the promise
    return emailNumber;
  }

  /**
   * Get email headers from the server
   * @param {number} count - Number of emails' headers to retrieve
   * @param {string} start - (optional) Start position in the inbox to begin retrieving from
   */
  public getEmailHeaders(count: number, start?: number): Promise<EmailHeadersResponse> {
    return new Promise<EmailHeadersResponse>(async (resolve, reject) => {
      try {
        // Connect to the server
        await this.connect();
        // Login to the server
        await this.login();

        // Get total number of emails in the inbox
        this.pop3Client.list();
        // Await the completion of the list operation
        const [listStatus, totalInboxCount, _, __, listStatusMessage] = await pEvent<
          string,
          [boolean, number, number, any, string]
        >(this.pop3Client, 'list', { multiArgs: true });

        // List operation failed
        if (!listStatus) {
          throw new InternalServerError(listStatusMessage);
        }

        // List operation succeeded, but inbox is empty
        if (totalInboxCount === 0) {
          // Return empty list and close the POP3 client connection
          this.pop3Client.quit();
          return resolve({ headerList: [], nextStartRange: null });
        }

        // Inbox is not empty, compute the retrieval range
        const { startRange, endRange, nextStartRange } = this.computeRetrievalRange(totalInboxCount, count, start);

        // Iterate from the start range to end range retrieving email headers
        const headerList: EmailHeader[] = [];
        for (let emailNumber = startRange; emailNumber >= endRange; emailNumber--) {
          // Retrieve header
          const emailHeader = await this.getHeadersAndUID(emailNumber);
          // Add to the list
          headerList.push(emailHeader);
        }

        // Close the POP3 client connection
        this.pop3Client.quit();
        // Return the list of email headers and the next start range
        resolve({ headerList, nextStartRange });
      } catch (error) {
        // Close the POP3 client connection
        this.pop3Client?.quit();
        // Reject the promise with the error
        reject(this.parseError(error));
      }
    });
  }

  /**
   * Get email body from the server
   * @param {number} id - ID of email whose body is to be retrieved
   */
  public getEmailBody(id: string): Promise<EmailBody> {
    return new Promise<EmailBody>(async (resolve, reject) => {
      try {
        // Connect to the server
        await this.connect();
        // Login to the server
        await this.login();

        // Get the email number for the given ID
        const emailNumber = await this.getEmailNumber(id);

        // Retrieve email body from the server
        this.pop3Client.retr(emailNumber);
        // Await the completion of the RETR operation
        const [retrStatus, _, body, retrStatusMessage] = await pEvent<string, [boolean, number, string, string]>(
          this.pop3Client,
          'retr',
          { multiArgs: true },
        );

        // RETR operation failed
        if (!retrStatus) {
          throw new InternalServerError(retrStatusMessage);
        }

        // RETR operation succeeded
        // Run the RSET command to unmark the email for deletion
        this.pop3Client.rset();

        // Await the completion of the RSET operation
        await pEvent(this.pop3Client, 'rset');
        // Close the POP3 client connection
        this.pop3Client.quit();

        // Return the email body
        const emailBody = EmailBody.createFromParsedMail(await simpleParser(body));
        resolve(emailBody);
      } catch (error) {
        // Close the POP3 client connection
        this.pop3Client?.quit();
        // Reject the promise with the error
        reject(this.parseError(error));
      }
    });
  }
}
