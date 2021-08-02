import POP3Client, { Config } from 'poplib';
import { simpleParser } from 'mailparser';
import { AuthenticationError } from '../model/error.model';
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
  private connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Initialize the POP3 client. This will initiate a connection to the server
      this.init();

      this.pop3Client.on('connect', (connectStatus, connectData) => {
        // Connection failed
        if (!connectStatus) {
          return reject(connectData);
        }

        // Config is required to use starttls, execute STLS, else resolve
        if (this.config.starttls) {
          // Execute STLS
          this.pop3Client.stls();
          this.pop3Client.on('stls', (stlsStatus, stlsData) => {
            // STLS failed
            if (!stlsStatus) {
              // Close the connection
              this.pop3Client.quit();
              return reject(stlsData);
            }

            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Given an email number, retrieve and parse its headers from the server
   * @param {number} emailNumber - Email number to retrieve
   */
  private retrieveAndParseEmailHeader(emailNumber: number): Promise<EmailHeader> {
    return new Promise<EmailHeader>((resolve, reject) => {
      // Retrieve the headers only and not the body
      this.pop3Client.top(emailNumber, 0);
      this.pop3Client.prependListener('top', (status, id, data, rawData) => {
        // Top operation failed
        if (!status) {
          return reject(rawData);
        }

        // Parse the raw email data
        simpleParser(data, (error, parsedHeader) => {
          // Parsing failed
          if (error) {
            return reject(error);
          }

          resolve(EmailHeader.createFromParsedMailAndEmailId(parsedHeader, id));
        });
      });
    });
  }

  /**
   * Get email headers from the server
   * @param {number} count - Number of emails' headers to retrieve
   * @param {string} start - (optional) Start position in the inbox to begin retrieving from
   */
  public getEmailHeaders(count: number, start?: number): Promise<EmailHeadersResponse> {
    return new Promise<EmailHeadersResponse>((resolve, reject) => {
      // Initialize the client and initiate a connection to the server
      this.connect()
        .then(() => {
          // Log in to the server
          this.pop3Client.login(this.config.user, this.config.password);
          this.pop3Client.on('login', (authStatus, authData) => {
            // Login failed
            if (!authStatus) {
              // Emit error on the POP3 client instance, so the error event listener can handle it
              return this.pop3Client.emit('error', new AuthenticationError(authData));
            }

            // Get total number of emails in the inbox
            this.pop3Client.list();
            this.pop3Client.on('list', async (listStatus, totalInboxCount, _, __, listData) => {
              // List operation failed
              if (!listStatus) {
                // Emit error on the POP3 client instance, so the error event listener can handle it
                return this.pop3Client.emit('error', listData);
              }

              // Compute retrieval range
              const { startRange, endRange, nextStartRange } = this.computeRetrievalRange(
                totalInboxCount,
                count,
                start,
              );
              // Iterate from the start range to end range retrieving email headers
              const headerList: EmailHeader[] = [];
              for (let emailNumber = startRange; emailNumber >= endRange; emailNumber--) {
                try {
                  // Add parsed email header to the list
                  headerList.push(await this.retrieveAndParseEmailHeader(emailNumber));
                } catch (error) {
                  // Stop loop execution and emit error on the POP3 client instance, so the error event listener can handle it
                  return this.pop3Client.emit('error', error);
                }
              }

              // Return the list of parsed email headers and close the POP3 client connection
              this.pop3Client.quit();
              resolve({ headerList, nextStartRange });
            });
          });
        })
        .catch((error) => {
          // Emit error on the POP3 client instance, so the error event listener can handle it
          this.pop3Client.emit('error', error);
        });

      // If an error occurs, close the POP3 client connection and reject the promise
      this.pop3Client.once('error', (error: any) => {
        this.pop3Client.quit();
        reject(error);
      });
    });
  }

  /**
   * Get email body from the server
   * @param {number} id - ID of email whose body is to be retrieved
   */
  public getEmailBody(id: number): Promise<EmailBody> {
    return new Promise<EmailBody>((resolve, reject) => {
      // Initialize the client and initiate a connection to the server
      this.connect()
        .then(() => {
          // Log in to the server
          this.pop3Client.login(this.config.user, this.config.password);
          this.pop3Client.on('login', (authStatus, authData) => {
            // Login failed
            if (!authStatus) {
              // Emit error on the POP3 client instance, so the error event listener can handle it
              return this.pop3Client.emit('error', new AuthenticationError(authData));
            }

            // Retrieve entire email body from the server
            this.pop3Client.retr(id);
            this.pop3Client.on('retr', (retrStatus, _, emailBody, retrData) => {
              // Retr operation failed
              if (!retrStatus) {
                // Emit error on the POP3 client instance, so the error event listener can handle it
                return this.pop3Client.emit('error', retrData);
              }

              // Parse the raw email body and return the parsed email body
              simpleParser(emailBody)
                .then((parsedMail) => {
                  // Return the parsed email body and close the IMAP client connection
                  this.pop3Client.quit();
                  resolve(EmailBody.createFromParsedMail(parsedMail));
                })
                .catch((error) => {
                  // Emit error on the POP3 client instance, so the error event listener can handle it
                  this.pop3Client.emit('error', error);
                });
            });
          });
        })
        .catch((error) => {
          // Emit error on the POP3 client instance, so the error event listener can handle it
          this.pop3Client.emit('error', error);
        });

      // If an error occurs, close the POP3 client connection and reject the promise
      this.pop3Client.once('error', (error: any) => {
        this.pop3Client.quit();
        reject(error);
      });
    });
  }
}
