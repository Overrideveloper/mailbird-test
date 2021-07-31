import Imap, { ImapMessage } from 'imap';
import { simpleParser } from 'mailparser';
import { EmailBody } from '../model/email-body.model';
import { EmailHeader } from '../model/email-header.model';
import { BaseEmailClient, BaseEmailClientConfig, EmailHeadersResponse } from './base.client';

/**
 * @class ImapEmailClient
 * @extends BaseEmailClient
 * @classdesc Email client that uses IMAP protocol for retrieval of email messages.
 */
export class IMAPEmailClient extends BaseEmailClient {
  private imapClient: Imap;

  constructor(private config: BaseEmailClientConfig) {
    super();
    this.init();
  }

  /**
   * Set up the IMAP client
   */
  private init(): void {
    this.imapClient = new Imap(this.config);
  }

  /**
   * Get email headers from the server
   * @param {number} count - Number of emails' headers to retrieve
   * @param {string} start - (optional) Start position in the inbox to begin retrieving from
   */
  public getEmailHeaders(count: number, start?: number): Promise<EmailHeadersResponse> {
    return new Promise<EmailHeadersResponse>((resolve, reject) => {
      // Connect to the IMAP server
      this.connect();

      // Attempt to retrieve email headers from the IMAP server when the connection is established
      this.imapClient.once('ready', () => {
        // Open the inbox in readonly mode
        this.imapClient.openBox('INBOX', true, (error: Error, inbox) => {
          // Error occurs when opening inbox
          if (error) {
            // Emit error on the IMAP client instance, so the error event listener can handle it
            this.imapClient.emit('error', error);
          } else {
            // Compute the start and end range of emails' headers to retrieve
            // If start range is not provide, start from the last email in the inbox
            const startRange = start ?? inbox.messages.total;
            // If endRange is less than the first email in the inbox, default to the first email in the inbox;
            const endRange = startRange - count ?? 1;
            // Next retrieval request start range i.e one less than the end range
            const nextStartRange = endRange - 1;
            // List of raw email headers and id to be parsed and returned when the stream is complete
            const rawHeaderList: Array<{ buffer: string; id: number }> = [];

            // Stream emails' headers from the inbox
            const headerStream = this.imapClient.seq.fetch(`${startRange}:${endRange}`, {
              bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
            });

            // An email header is retrieved from the stream
            headerStream.on('message', (message: ImapMessage) => {
              // Create a buffer to store the raw email header
              let buffer = '';
              let id: number;

              // Stream the message body in chunks
              message.on('body', (stream) => {
                // Convert the data chunks to a string and append to the buffer
                stream.on('data', (chunk) => (buffer += chunk.toString('utf8')));
              });

              // Message attributes are retrieved from the stream
              message.on('attributes', (attributes) => {
                // Get the message id
                id = attributes.uid;
              });

              // Message body stream is complete
              // Add the raw email headers and id to the list of raw headers
              message.once('end', () => rawHeaderList.push({ buffer, id }));
            });

            // If an error occurs in the stream, emit it on the IMAP client instance, so the error event listener can handle it
            headerStream.once('error', (error: Error) => this.imapClient.emit('error', error));

            // Stream is complete
            headerStream.once('end', () => {
              // Parse the list of raw email headers and return the parsed headers
              // Reverse the list so that the latest emails come first in the list
              const parsedHeaderPromiseList = rawHeaderList.reverse().map(({ buffer, id }) => {
                return new Promise<EmailHeader>((resolve, reject) => {
                  simpleParser(buffer)
                    .then((parsedHeader) => resolve(EmailHeader.createFromParsedMailAndEmailId(parsedHeader, id)))
                    .catch((error) => reject(error));
                });
              });

              Promise.all(parsedHeaderPromiseList)
                .then((headerList) => {
                  // Return the list of parsed email headers and close the IMAP client connection
                  this.imapClient.end();
                  resolve({ headerList, nextStartRange });
                })
                .catch((error) => {
                  // Emit error on the IMAP client instance, so the error event listener can handle it
                  this.imapClient.emit('error', error);
                });
            });
          }
        });
      });

      // If an error occurs on the IMAP client, reject with the error and close the IMAP client connection
      this.imapClient.once('error', (error: Error) => {
        this.imapClient.end();
        reject(error);
      });
    });
  }

  /**
   * Get email body from the server
   * @param {string} id - ID of email whose body is to be retrieved
   */
  public getEmailBody(id: string): Promise<EmailBody> {
    return new Promise<EmailBody>((resolve, reject) => {
      // Connect to the IMAP server
      this.connect();

      // Attempt to retrieve email body from the IMAP server when the connection is established
      this.imapClient.once('ready', () => {
        // Open the inbox in readonly mode
        this.imapClient.openBox('INBOX', true, (error: Error, inbox) => {
          // Error occurs when opening inbox
          if (error) {
            // Emit error on the IMAP client instance, so the error event listener can handle it
            this.imapClient.emit('error', error);
          } else {
            // Stream entire email body from the inbox
            const bodyStream = this.imapClient.fetch(id, { bodies: '' });
            // Buffer to store raw email body
            let buffer = '';

            // Email body is retrieved from the stream
            bodyStream.on('message', (message: ImapMessage) => {
              // Stream the message body in chunks
              message.on('body', (stream) => {
                // Convert the data chunks to a string and append to the buffer
                stream.on('data', (chunk) => (buffer += chunk.toString('utf8')));
              });
            });

            // If an error occurs in the stream, emit it on the IMAP client instance, so the error event listener can handle it
            bodyStream.once('error', (error: Error) => this.imapClient.emit('error', error));

            // Stream is complete
            bodyStream.once('end', () => {
              // Parse the raw email body and return the parsed email body
              simpleParser(buffer)
                .then((parsedMail) => {
                  // Return the parsed email body and close the IMAP client connection
                  this.imapClient.end();
                  resolve(EmailBody.createFromParsedMail(parsedMail));
                })
                .catch((error) => {
                  // Emit error on the IMAP client instance, so the error event listener can handle it
                  this.imapClient.emit('error', error);
                });
            });
          }
        });
      });

      // If an error occurs on the IMAP client, reject with the error and close the IMAP client connection
      this.imapClient.once('error', (error: Error) => {
        this.imapClient.end();
        reject(error);
      });
    });
  }

  /**
   * Connect to the IMAP server
   */
  private connect(): void {
    // Ensure that the IMAP client is initialized
    if (!this.imapClient) {
      this.init();
    }

    // Connect to the IMAP server
    this.imapClient.connect();
  }
}
