import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createValidator, ValidatedRequest } from 'express-joi-validation';
import { CustomError } from '../model/error.model';
import { EmailService } from '../services/email.service';
import { EmailBodyRetrievalRequest, EmailHeaderRetrievalRequest } from '../model/email/email-retrieval-request.model';
import {
  EmailRetrievalRequestSchema,
  emailRetrievalRequestSchema,
} from '../validators/email-retrieval-request.validators';

// Instantiate the router
const router = Router();
// Instantiate request validator
const validator = createValidator();

/**
 * Handle error in the router.
 */
function handleError(error: any, res: Response) {
  // Custom system-generated error
  if (error instanceof CustomError) {
    res.status(error.code).send(error);
  }
  // Other error
  else {
    // Return a 500 error
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

// Route/endpoint for retrieving email headers
router.post(
  '/email/retrieve_headers',
  validator.body(emailRetrievalRequestSchema),
  async (req: ValidatedRequest<EmailRetrievalRequestSchema>, res: Response) => {
    try {
      // Get email header retrieval request from HTTP request payload
      const emailHeaderRetrievalRequest: EmailHeaderRetrievalRequest =
        EmailHeaderRetrievalRequest.createFromHTTPRequest(req);
      // Perform email header retrieval request
      const retrievedHeaderList = await EmailService.getEmailHeaders(emailHeaderRetrievalRequest);
      // Return the retrieved email headers
      res.status(StatusCodes.OK).send(retrievedHeaderList);
    } catch (error: any) {
      // Handle error
      handleError(error, res);
    }
  },
);

// Route/endpoint for retrieving email body
router.post(
  '/email/:emailId/retrieve_body',
  validator.body(emailRetrievalRequestSchema),
  async (req: ValidatedRequest<EmailRetrievalRequestSchema>, res: Response) => {
    try {
      // Get email body retrieval request from HTTP request payload
      const emailBodyRetrievalRequest: EmailBodyRetrievalRequest = EmailBodyRetrievalRequest.createFromHTTPRequest(req);
      // Perform email body retrieval request
      const retrievedBody = await EmailService.getEmailBody(emailBodyRetrievalRequest);
      // Return the retrieved email body
      res.status(StatusCodes.OK).send(retrievedBody);
    } catch (error) {
      // Handle error
      handleError(error, res);
    }
  },
);

export default router;
