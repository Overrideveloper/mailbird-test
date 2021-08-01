/**
 * Possible/allowed EmailClient connection encryption types
 */
export enum ConnectionEncryption {
  Unencrypted = 'unencrypted',
  SSL_TLS = 'SSL/TLS',
  STARTTLS = 'STARTTLS',
}

/**
 * EmailClient connection configuration data
 */
export interface ConnectionConfiguration {
  user: string;
  password: string;
  encryption: ConnectionEncryption;
}

/**
 * Possible/allowed EmailClient server types
 */
export enum EmailServerType {
  IMAP = 'IMAP',
  POP3 = 'POP3',
}
