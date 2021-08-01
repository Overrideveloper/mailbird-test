import { ConnectionOptions } from 'tls';
import { EmailBody } from '../model/email/email-body.model';
import { BaseEmailClient, EmailHeadersResponse } from '../clients/base.client';
import { IMAPEmailClient } from '../clients/imap.client';
import { Configuration } from '../common/configuration.common';
import { ConnectionEncryption, EmailServerType } from '../model/connection.model';
import { IMAP_PORT_NOSSL_FALLBACK, IMAP_PORT_SSL_FALLBACK } from '../constants/configuration.constants';
import {
  EmailBodyRetrievalRequest,
  EmailHeaderRetrievalRequest,
  EmailRetrievalRequest,
} from '../model/email/email-retrieval-request.model';
import { AuthenticationError, BadRequestError, CustomError, InternalServerError } from '../model/error.model';

/**
 * This service is responsible for interacting with the email clients to retrieve email headers and bodies
 */
export class EmailService {
  /**
   * Process the request to retrieve email headers
   * @param {EmailHeaderRetrievalRequest} emailHeaderRetrievalRequest - The email headers retrieval request
   */
  public static getEmailHeaders(
    emailHeaderRetrievalRequest: EmailHeaderRetrievalRequest,
  ): Promise<EmailHeadersResponse> {
    // Get the email client to perform this request
    const emailClient: BaseEmailClient = this.determineAndInitializeEmailClient(emailHeaderRetrievalRequest);
    // Perform the request
    return new Promise((resolve, reject) => {
      emailClient
        .getEmailHeaders(emailHeaderRetrievalRequest.count, emailHeaderRetrievalRequest.start)
        .then((emailHeadersResponse) => resolve(emailHeadersResponse))
        .catch((error) => reject(this.handleError(error)));
    });
  }

  /**
   * Process the request to retrieve an email body
   * @param {EmailBodyRetrievalRequest} emailBodyRetrievalRequest - The email body retrieval request
   */
  public static getEmailBody(emailBodyRetrievalRequest: EmailBodyRetrievalRequest): Promise<EmailBody> {
    // Get the email client to perform this request
    const emailClient: BaseEmailClient = this.determineAndInitializeEmailClient(emailBodyRetrievalRequest);
    // Perform the request
    return new Promise((resolve, reject) => {
      emailClient
        .getEmailBody(emailBodyRetrievalRequest.emailId)
        .then((emailBody) => resolve(emailBody))
        .catch((error) => reject(this.handleError(error)));
    });
  }

  /**
   * Determine and intialize the appropriate email client depending on the retrieval request
   * @param {EmailRetrievalRequest} emailRetrievalRequest - The retrieval request
   */
  private static determineAndInitializeEmailClient(emailRetrievalRequest: EmailRetrievalRequest): BaseEmailClient {
    let emailClient: BaseEmailClient;

    switch (emailRetrievalRequest.serverType) {
      case EmailServerType.IMAP:
        // Get IMAP hostname from configuration
        const host = Configuration.getValue('IMAP_HOST');
        let port: number;
        let tls: boolean;
        let tlsOptions: ConnectionOptions;

        // Determine port and TLS config from encryption set in the retrieval request
        if (emailRetrievalRequest.connectionOptions.encryption === ConnectionEncryption.SSL_TLS) {
          port = Configuration.getValue('IMAP_PORT_SSL', IMAP_PORT_SSL_FALLBACK);
          tls = true;
          tlsOptions = { servername: host };
        } else {
          port = Configuration.getValue('IMAP_PORT_NOSSL', IMAP_PORT_NOSSL_FALLBACK);
          tls = false;
        }

        // Initialize the IMAP client
        emailClient = new IMAPEmailClient({
          host,
          port,
          tls,
          tlsOptions,
          user: emailRetrievalRequest.connectionOptions.user,
          password: emailRetrievalRequest.connectionOptions.password,
        });
        break;

      case EmailServerType.POP3:
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
    // Else original error
    return new InternalServerError(error);
  }
}
