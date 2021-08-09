import { Encryption } from '../connection/encryption.enum';
import { ServerType } from '../connection/server-type.enum';

/**
 * Data for making requests to retrieve an emails' headers or body
 */
export class EmailRetrievalRequest {
  // The username of the email account to retrieve the email from
  public user: string;
  // The password of the email account to retrieve the email from
  public password: string;
  // The encryption type to use in connecting to the email account
  public encryption: Encryption;
  // The server type to connect to
  public serverType: ServerType;
  // The hostname of the server to connect to
  public hostname: string;
  // The port number of the server to connect to
  public port: number;

  constructor(data: {
    user: string;
    password: string;
    encryption: Encryption;
    serverType: ServerType;
    hostname: string;
    port: number;
  }) {
    this.user = data?.user ?? '';
    this.password = data?.password ?? '';
    this.encryption = data?.encryption ?? null;
    this.serverType = data?.serverType ?? null;
    this.hostname = data?.hostname ?? '';
    this.port = data?.port ?? null;
  }

  /**
   * Create a new EmailRetrievalRequest object from form data
   * @param {any} data - Data from the form
   */
  public static createFromForm(data: any): EmailRetrievalRequest {
    return new EmailRetrievalRequest(data);
  }
}
