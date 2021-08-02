import { EmailBody } from '../model/email/email-body.model';
import { BaseEmailClient, EmailHeadersResponse } from '../clients/base.client';
import { POP3EmailClient } from '../clients/pop3.client';
import { IMAPEmailClient } from '../clients/imap.client';
import { Configuration } from '../common/configuration.common';
import { ConnectionEncryption, EmailServerType } from '../model/connection.model';
import { IMAP_PORT_NOSSL_FALLBACK, IMAP_PORT_SSL_FALLBACK, POP3_PORT_NOSSL_FALLBACK, POP3_PORT_SSL_FALLBACK } from '../constants/configuration.constants';
import { AuthenticationError, BadRequestError, CustomError, GatewayTimeoutError, InternalServerError } from '../model/error.model';
import {
  EmailBodyRetrievalRequest,
  EmailHeaderRetrievalRequest,
  EmailRetrievalRequest,
} from '../model/email/email-retrieval-request.model';

/**
 * This service is responsible for interacting with the email clients to retrieve email headers and bodies
 */
export class EmailService {
  /**
   * Process the request to retrieve email headers
   * @param {EmailHeaderRetrievalRequest} emailHeaderRetrievalRequest - The email headers retrieval request
   */
  public static async getEmailHeaders(
    emailHeaderRetrievalRequest: EmailHeaderRetrievalRequest,
  ): Promise<EmailHeadersResponse> {
    try {
      // Get the email client to perform this request
      const emailClient: BaseEmailClient = this.determineAndInitializeEmailClient(emailHeaderRetrievalRequest);
      // Perform the request
      return await emailClient.getEmailHeaders(emailHeaderRetrievalRequest.count, emailHeaderRetrievalRequest.start);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process the request to retrieve an email body
   * @param {EmailBodyRetrievalRequest} emailBodyRetrievalRequest - The email body retrieval request
   */
  public static async getEmailBody(emailBodyRetrievalRequest: EmailBodyRetrievalRequest): Promise<EmailBody> {
    try {
      // Get the email client to perform this request
      const emailClient: BaseEmailClient = this.determineAndInitializeEmailClient(emailBodyRetrievalRequest);
      // Perform the request
      return await emailClient.getEmailBody(emailBodyRetrievalRequest.emailId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Determine and intialize the appropriate email client depending on the retrieval request
   * @param {EmailRetrievalRequest} emailRetrievalRequest - The retrieval request
   */
  private static determineAndInitializeEmailClient(emailRetrievalRequest: EmailRetrievalRequest): BaseEmailClient {
    let emailClient: BaseEmailClient;
    let host: string;
    let port: number;
    let tls: boolean;
    let starttls: boolean;

    switch (emailRetrievalRequest.serverType) {
      case EmailServerType.IMAP:
        // Get IMAP hostname from configuration
        host = Configuration.getValue('IMAP_HOST');

        // Set config for SSL/TLS connections
        if (emailRetrievalRequest.connectionOptions.encryption === ConnectionEncryption.SSL_TLS) {
          port = parseInt(Configuration.getValue('IMAP_PORT_SSL', IMAP_PORT_SSL_FALLBACK));
          tls = true;
        }
        // Set config for unencrypted connections
        else {
          port = parseInt(Configuration.getValue('IMAP_PORT_NOSSL', IMAP_PORT_NOSSL_FALLBACK));
          tls = false;
          // Extra config for STARTTLS connections
          starttls = emailRetrievalRequest.connectionOptions.encryption === ConnectionEncryption.STARTTLS;
        }

        // Initialize the IMAP client
        emailClient = new IMAPEmailClient({
          host,
          port,
          tls,
          starttls,
          user: emailRetrievalRequest.connectionOptions.user,
          password: emailRetrievalRequest.connectionOptions.password,
        });
        break;

      case EmailServerType.POP3:
        // Get POP3 hostname from configuration
        host = Configuration.getValue('POP3_HOST');

        // Set config for SSL/TLS connections
        if (emailRetrievalRequest.connectionOptions.encryption === ConnectionEncryption.SSL_TLS) {
          port = parseInt(Configuration.getValue('POP3_PORT_SSL', POP3_PORT_SSL_FALLBACK));
          tls = true;
        }
        // Set config for unencrypted connections
        else {
          port = parseInt(Configuration.getValue('POP3_PORT_NOSSL', POP3_PORT_NOSSL_FALLBACK));
          tls = false;
        }

        // Initialize the POP3 client
        emailClient = new POP3EmailClient({
          host,
          port,
          tls,
          user: emailRetrievalRequest.connectionOptions.user,
          password: emailRetrievalRequest.connectionOptions.password,
        });
        break;

      default:
        throw new BadRequestError(`Invalid server type`);
    }

    return emailClient;
  }

  /**
   * Determine the type of error to return based on the error source
   */
  private static handleError(error: any): CustomError {
    // If error source is authentication, return an AuthenticationError
    if (error?.source?.toLowerCase() === 'authentication') {
      return new AuthenticationError(error);
    } 
    // If error source is timeout, return a GatewayTimeoutError
    if (error?.source?.toLowerCase() === 'timeout' || error?.code === 'ETIMEDOUT') {
      return new GatewayTimeoutError(error);
    }
    // If error is already a custom error, return it
    if (error instanceof CustomError) {
      return error;
    }
    // Else error as an internal server error
    return new InternalServerError(error);
  }
}
