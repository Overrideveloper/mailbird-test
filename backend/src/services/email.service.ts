import { EmailBody } from '../model/email/email-body.model';
import { BaseEmailClient, BaseEmailClientConfig, EmailHeadersResponse } from '../clients/base.client';
import { POP3EmailClient } from '../clients/pop3.client';
import { IMAPEmailClient } from '../clients/imap.client';
import { ConnectionEncryption, EmailServerType } from '../model/connection.model';
import { BadRequestError } from '../model/error.model';
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
  public static getEmailHeaders(
    emailHeaderRetrievalRequest: EmailHeaderRetrievalRequest,
  ): Promise<EmailHeadersResponse> {
    // Get the email client to perform this request
    const emailClient: BaseEmailClient = this.determineAndInitializeEmailClient(emailHeaderRetrievalRequest);
    // Perform the request
    return emailClient.getEmailHeaders(emailHeaderRetrievalRequest.count, emailHeaderRetrievalRequest.start);
  }

  /**
   * Process the request to retrieve an email body
   * @param {EmailBodyRetrievalRequest} emailBodyRetrievalRequest - The email body retrieval request
   */
  public static async getEmailBody(emailBodyRetrievalRequest: EmailBodyRetrievalRequest): Promise<EmailBody> {
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

    const config: BaseEmailClientConfig = {
      ...emailRetrievalRequest.connectionOptions,
      host: emailRetrievalRequest.connectionOptions.hostname,
      tls: emailRetrievalRequest.connectionOptions.encryption === ConnectionEncryption.SSL_TLS,
      starttls: emailRetrievalRequest.connectionOptions.encryption === ConnectionEncryption.STARTTLS,
    };

    switch (emailRetrievalRequest.serverType) {
      case EmailServerType.IMAP:
        emailClient = new IMAPEmailClient(config);
        break;

      case EmailServerType.POP3:
        emailClient = new POP3EmailClient(config);
        break;

      default:
        throw new BadRequestError(`Invalid server type`);
    }

    return emailClient;
  }
}
