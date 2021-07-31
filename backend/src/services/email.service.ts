import { ConnectionOptions } from 'tls';
import { EmailBody } from '../model/email-body.model';
import { BaseEmailClient, EmailHeadersResponse } from '../clients/base.client';
import { IMAPEmailClient } from '../clients/imap.client';
import { Configuration } from '../common/configuration.common';
import { ConnectionEncryption } from '../model/connection.model';
import { IMAP_PORT_NOSSL_FALLBACK, IMAP_PORT_SSL_FALLBACK } from '../constants/configuration.constants';
import {
  EmailBodyRetrievalRequest,
  EmailHeaderRetrievalRequest,
  EmailRetrievalRequest,
} from '../model/email-retrieval-request.model';

/**
 * This service is responsible for interacting with the email clients to retrieve email headers and bodies
 */
export class EmailService {
  /**
   * Process the request to retrieve email headers
   * @param {EmailHeaderRetrievalRequest} emailHeaderRetrievalRequest - The email headers retrieval request
   */
  public static getEmailHeaders(emailHeaderRetrievalRequest: EmailHeaderRetrievalRequest): Promise<EmailHeadersResponse> {
    // Get the email client to perform this request
    const emailClient: BaseEmailClient = this.determineAndInitializeEmailClient(emailHeaderRetrievalRequest);
    // Perform the request
    return emailClient.getEmailHeaders(emailHeaderRetrievalRequest.count, emailHeaderRetrievalRequest.start);
  }

  /**
   * Process the request to retrieve an email body
   * @param {EmailBodyRetrievalRequest} emailBodyRetrievalRequest - The email body retrieval request
   */
  public static getEmailBody(emailBodyRetrievalRequest: EmailBodyRetrievalRequest): Promise<EmailBody> {
    // Get the email client to perform this request
    const emailClient: BaseEmailClient = this.determineAndInitializeEmailClient(emailBodyRetrievalRequest);
    // Perform the request
    return emailClient.getEmailBody(emailBodyRetrievalRequest.emailId);
  }

  /**
   * Determine and intialize the appropriate email client depending on the retrieval request
   * @param {EmailRetrievalRequest} emailRetrievalRequest - The retrieval request
   */
  private static determineAndInitializeEmailClient(emailRetrievalRequest: EmailRetrievalRequest): BaseEmailClient {
    let emailClient: BaseEmailClient;

    switch (emailRetrievalRequest.serverType) {
      case 'IMAP':
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

      case 'POP3':
        break;

      default:
        throw new Error(`Email Service: Invalid Server Type`);
    }

    return emailClient;
  }
}
