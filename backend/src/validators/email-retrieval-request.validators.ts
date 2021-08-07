import Joi from 'joi';
import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';
import { ConnectionEncryption, EmailServerType } from '../model/connection.model';

// Validation schema for the email retrieval request body
export const emailRetrievalRequestSchema = Joi.object({
  serverType: Joi.string().valid(EmailServerType.IMAP, EmailServerType.POP3).required(),
  user: Joi.string().required(),
  password: Joi.string().required(),
  port: Joi.number().port().required(),
  hostname: Joi.string().hostname().required(),
  encryption: Joi.string()
    .valid(ConnectionEncryption.SSL_TLS, ConnectionEncryption.STARTTLS, ConnectionEncryption.Unencrypted)
    .required(),
});

// This interface types the validated email retrieval request
export interface EmailRetrievalRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Body]: {
    serverType: EmailServerType;
    user: string;
    password: string;
    port: number;
    hostname: string;
    encryption: ConnectionEncryption;
  };
}
