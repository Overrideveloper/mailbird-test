import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EmailRetrievalRequest } from '../model/email/email-retrieval-request.model';
import { EmailHeaderRetrievalResponse } from '../model/email/email-header-retrieval-response.model';
import { EmailBody } from '../model/email/email-body.model';

/**
 * This service provides functionality for retrieving emails' headers and body
 */
@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly apiURL = environment.apiURL;
  constructor(public readonly http: HttpClient) {}

  /**
   * Retrieve a list of emails' headers from the backend
   * @param {EmailRetrievalRequest} emailRetrievalRequest - Email retrieval request
   * @param {number} start - Start index for backend to begin retrieving from
   */
  public getEmailHeaders(
    emailRetrievalRequest: EmailRetrievalRequest,
    start?: number
  ): Observable<EmailHeaderRetrievalResponse> {
    let options = {};

    // If start index is provided, add it as a query parameter
    if (start) {
      options = { params: { start } };
    }

    return this.http
      .post<EmailHeaderRetrievalResponse>(
        `${this.apiURL}/email/retrieve_headers`,
        emailRetrievalRequest,
        options
      )
      .pipe(
        // Parse data from the backend to a EmailHeaderRetrievalResponse
        map((data) => EmailHeaderRetrievalResponse.createFromAPI(data))
      );
  }

  /**
   * Retrieve a given email ID's body from the backend
   * @param {EmailRetrievalRequest} emailRetrievalRequest - Email retrieval request
   * @param {number} emailId - Email ID
   */
  public getEmailBody(
    emailRetrievalRequest: EmailRetrievalRequest,
    emailId: number
  ): Observable<EmailBody> {
    return this.http
      .post<EmailBody>(
        `${this.apiURL}/email/${emailId}/retrieve_body`,
        emailRetrievalRequest
      )
      .pipe(
        // Parse data from the backend to a EmailBody
        map((data) => EmailBody.createFromAPI(data))
      );
  }
}
