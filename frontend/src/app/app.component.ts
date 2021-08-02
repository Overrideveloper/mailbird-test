import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { EmailBody } from './shared/model/email/email-body.model';
import { EmailHeader } from './shared/model/email/email-header.model';
import { EmailRetrievalRequest } from './shared/model/email/email-retrieval-request.model';
import { EmailService } from './shared/services/email.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // Indicates whether a request to load email headers is in progress
  public loadingEmailHeaders = false;
  // Indicates whether a request to load an email body is in progress
  public loadingEmailBody = false;
  // Email body loaded for current selected email header
  public loadedEmailBody!: EmailBody;
  // Cached email retrieval request to use for subsequent requests to the backend
  public cachedEmailRetrievalRequest!: EmailRetrievalRequest;
  // Next index to begin subsequent email header retrieval from
  public nextHeaderRetrievalStartRange!: number;
  // Indicates that email headers have been loaded at least once
  public haveEmailHeadersBeenLoaded = false;
  // Stream of new email headers loaded from the backend to pass to EmailHeaderListComponent
  public newEmailHeaderList$ = new Subject<EmailHeader[]>();

  constructor(private readonly emailService: EmailService) {}

  /**
   * Handle "start" event from ConnectionBarComponent
   */
  public handleStartEvent(emailRetrievalRequest: any): void {
    // Load email headers from backend
    this.loadEmailHeaders(emailRetrievalRequest, true);
  }

  /**
   * Handle "loadMoreHeaders" event from EmailHeaderListComponent
   */
  public handleLoadMoreHeadersEvent(): void {
    // Load email headers from backend, using cached email retrieval request and next header retrieval start range
    this.loadEmailHeaders(
      this.cachedEmailRetrievalRequest,
      false,
      this.nextHeaderRetrievalStartRange
    );
  }

  /**
   * Handle "displayEmailBody" event from EmailHeaderListComponent
   * @param {number} emailId - ID of email whose body is to be displayed
   * @param {boolean} [displayEmailBodyInModal] - Indicates whether to display the email body in a modal (usually for small size screens)
   */
  public handleDisplayEmailBodyEvent(emailId: number, displayEmailBodyInModal?: boolean): void {
    // Load email body from backend
    this.loadEmailBody(emailId);
  }

  /**
   * Load email headers
   * @param {EmailRetrievalRequest} emailRetrievalRequest - Email retrieval request
   * @param {boolean} cacheEmailRetrievalRequest - Indicates whether to cache the provided email retrieval request on successful retrieval
   * @param {number} [start] - Start index to begin loading emails from
   */
  private loadEmailHeaders(
    emailRetrievalRequest: EmailRetrievalRequest,
    cacheEmailRetrievalRequest: boolean,
    start?: number
  ): void {
    // Indicate that a request to load email headers is in progress
    this.loadingEmailHeaders = true;

    // Load email headers from backend
    this.emailService.getEmailHeaders(emailRetrievalRequest, start).subscribe(
      (emailHeaderRetrievalResponse) => {
        // Stream new email headers to EmailHeaderListComponent
        this.newEmailHeaderList$.next(emailHeaderRetrievalResponse.headerList);
        // Store next header retrieval start range
        this.nextHeaderRetrievalStartRange =
          emailHeaderRetrievalResponse.nextStartRange;
        // Indicate that email headers have been loaded at least once
        this.haveEmailHeadersBeenLoaded = true;
        // Indicate that a request to load email headers has ended
        this.loadingEmailHeaders = false;

        if (cacheEmailRetrievalRequest) {
          // Cache email retrieval request for subsequent requests
          this.cachedEmailRetrievalRequest = emailRetrievalRequest;
        }
      },
      () => {
        // Indicate that a request to load email headers has ended
        this.loadingEmailHeaders = false;
      }
    );
  }

  /**
   * Load email body
   * @param {number} emailId - Email ID
   */
  private loadEmailBody(emailId: number): void {
    // Indicate that a request to load an email body is in progress
    this.loadingEmailBody = true;

    // Load email body from backend using cached email retrieval request and provided email ID
    this.emailService
      .getEmailBody(this.cachedEmailRetrievalRequest, emailId)
      .subscribe(
        (emailBody) => {
          // Store the loaded email body
          this.loadedEmailBody = emailBody;
          // Indicate that a request to load an email body has ended
          this.loadingEmailBody = false;
        },
        () => {
          // Indicate that a request to load an email body has ended
          this.loadingEmailBody = false;
        }
      );
  }
}
