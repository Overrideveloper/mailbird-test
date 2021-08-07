import Imap, { Box, ImapFetch, ImapMessage, ImapMessageAttributes } from 'imap';
import { simpleParser } from 'mailparser';
import pEvent from 'p-event';
import { ConnectionOptions } from 'tls';
import { promisify } from 'util';
import { EmailBody } from '../model/email/email-body.model';
import { EmailHeader } from '../model/email/email-header.model';
import { BaseEmailClient, BaseEmailClientConfig, EmailHeadersResponse } from './base.client';

/**
 * Email client that uses the IMAP protocol.
 */
export class IMAPEmailClient extends BaseEmailClient {
  private imapClient: Imap;
  private openBox: (mailboxName: 'INBOX', openReadOnly: boolean) => Promise<Imap.Box>;

  constructor(private config: BaseEmailClientConfig) {
    super();
    this.init();
  }

  /**
   * Set up the IMAP client
   */
  private init(): void {
    let tlsOptions: ConnectionOptions;

    // Set the TLS options if the config requires a TLS connection
    if (this.config.tls) {
      tlsOptions = {
        rejectUnauthorized: false,
        servername: this.config.host,
      };
    }

    // Initialize the IMAP client
    this.imapClient = new Imap({
      ...this.config,
      tlsOptions,
      autotls: this.config.starttls ? 'required' : 'never',
    });

    // Promisify the openBox method
    this.openBox = promisify(
      (mailboxName: 'INBOX', openReadOnly: boolean, callback: (error: Error, mailbox: Box) => void) =>
        this.imapClient.openBox(mailboxName, openReadOnly, (error: Error, mailbox: Box) => callback(error, mailbox)),
    );
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

  /**
   * Get data from a fetch stream
   * @param {ImapFetch} - Fetch stream
   * @param {number} - Number of data items that the fetch stream has
   *
   * Returns an array of streamed data and their attributes
   */
  private getDataFromFetchStream(
    fetchStream: ImapFetch,
    fetchCount: number,
  ): Promise<Array<{ attributes: ImapMessageAttributes; buffer: string }>> {
    return new Promise((resolve, reject) => {
      // Streamed data
      const streamedDataList: Array<{ attributes: ImapMessageAttributes; buffer: string }> = [];
      // Number of data items that remain to be streamed
      let remainingFetchCount = fetchCount;

      // Data is emitted from the fetch stream
      fetchStream.on('message', (message: ImapMessage) => {
        // Create a buffer to store the streamed data
        let buffer = '';
        // Store the attributes for the streamed data
        let attributes: ImapMessageAttributes;

        // Stream the attributes and store them
        message.on('attributes', (attrs) => (attributes = attrs));
        // Stream the data body in chunks appending to the buffer
        message.on('body', (stream) => stream.on('data', (chunk) => (buffer += chunk.toString('utf8'))));
        // Data stream is complete,
        message.once('end', () => {
          // Add the streamed data to the list
          streamedDataList.push({ buffer, attributes });
          // Decrement the number of data items that remain to be streamed
          remainingFetchCount -= 1;
          // If all the data items have been streamed, resolve the promise
          if (remainingFetchCount === 0) {
            resolve(streamedDataList);
          }
        });
      });

      // Error occurs in the fetch stream, reject the promise
      fetchStream.once('error', (error: Error) => reject(error));
    });
  }

  /**
   * Get email headers from the server
   * @param {number} count - Number of emails' headers to retrieve
   * @param {string} start - (optional) Start position in the inbox to begin retrieving from
   */
  public getEmailHeaders(count: number, start?: number): Promise<EmailHeadersResponse> {
    return new Promise<EmailHeadersResponse>(async (resolve, reject) => {
      try {
        // Connect to the IMAP server
        this.connect();
        // Wait for the connection to be established
        await pEvent<string, void>(this.imapClient, 'ready');
        // Wait for the inbox to be opened in readonly mode
        const inbox = await this.openBox('INBOX', true);

        // If inbox empty, stop execution and return and empty list
        if (inbox.messages.total === 0) {
          // Close the IMAP client connection
          this.imapClient.end();
          // Return an empty list
          return resolve({ headerList: [], nextStartRange: null });
        }

        // Compute retrieval range
        const { startRange, endRange, nextStartRange } = this.computeRetrievalRange(inbox.messages.total, count, start);

        // Fetch emails from the inbox
        const fetchStream = this.imapClient.seq.fetch(`${startRange}:${endRange}`, {
          bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
        });

        // Get the email headers and their attributes from the fetch stream
        const streamedDataList = await this.getDataFromFetchStream(fetchStream, startRange - endRange + 1);

        // Parse the email headers
        const parsedHeaderPromiseList = streamedDataList.map((data) => {
          const { buffer, attributes } = data;
          return simpleParser(buffer).then((parsedHeader) =>
            EmailHeader.createFromParsedMailAndEmailId(parsedHeader, attributes.uid),
          );
        });

        // Get the parsed email headers
        const headerList = await Promise.all(parsedHeaderPromiseList);
        // CLose the IMAP client connection
        this.imapClient.end();
        // Return the email headers
        return resolve({ headerList, nextStartRange });
      } catch (error) {
        // CLose the IMAP client connection
        this.imapClient?.end();
        // Reject the promise
        reject(this.parseError(error));
      }
    });
  }

  /**
   * Get email body from the server
   * @param {number} id - ID of email whose body is to be retrieved
   */
  public getEmailBody(id: number): Promise<EmailBody> {
    return new Promise<EmailBody>(async (resolve, reject) => {
      try {
        // Connect to the IMAP server
        this.connect();
        // Wait for the connection to be established
        await pEvent<string, void>(this.imapClient, 'ready');
        // Wait for the inbox to be opened in readonly mode
        await this.openBox('INBOX', true);

        // Fetch the email from the inbox
        const fetchStream = this.imapClient.fetch(id, { bodies: '' });

        // Get the email body from the fetch stream
        const streamedData = (await this.getDataFromFetchStream(fetchStream, 1))[0].buffer;

        // Parse the email body
        const emailBody = EmailBody.createFromParsedMail(await simpleParser(streamedData));
        // Close the IMAP client connection
        this.imapClient.end();
        // Return the email body
        resolve(emailBody);
      } catch (error) {
        // CLose the IMAP client connection
        this.imapClient?.end();
        // Reject the promise
        reject(this.parseError(error));
      }
    });
  }
}
