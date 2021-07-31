import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EmailBodyRetrievalRequest, EmailHeaderRetrievalRequest } from '../model/email-retrieval-request.model';
import { EmailService } from '../services/email.service';

const router = Router();

/**
 * Handle error in the router.
 *
 * Determine error type and return appropriate response.
 */
function handleError(error: any, res: Response) {
  // Authentication error
  if (error?.source?.toLowerCase() === 'authentication') {
    // Return a 401 error
    res.status(StatusCodes.UNAUTHORIZED).send(error);
  }
  // Other internal error
  else {
    // Return a 500 error
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

router.post('/email/retrieve_headers', async (req: Request, res: Response) => {
  try {
    // Get email header retrieval request from HTTP request payload
    const emailHeaderRetrievalRequest: EmailHeaderRetrievalRequest =
      EmailHeaderRetrievalRequest.createFromHTTPRequest(req);
    // Perform email header retrieval request
    const retrievedHeaderList = await EmailService.getEmailHeaders(emailHeaderRetrievalRequest);
    // Return the retrieved email headers
    res.status(StatusCodes.OK).send(retrievedHeaderList);
  } catch (error) {
    // Handle error
    handleError(error, res);
  }
});

router.post('/email/:emailId/retrieve_body', async (req: Request, res: Response) => {
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
});

export default router;
