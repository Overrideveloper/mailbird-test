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
  // Indicates if a request to load email headers is in progress
  public loadingEmailHeaders = false;
  // Indicates if a request to load an email body is in progress
  public loadingEmailBody = false;
  // Indicates if this is the first time a request to load email headers has been made
  public isFirstEmailHeaderRequest = true;
  // Currently selected email header to load body for
  public selectedEmailHeader!: EmailHeader;
  // Email body loaded for current selected email header
  public selectedEmailBody!: EmailBody;
  // Cached email retrieval request to use for subsequent requests to the backend
  public cachedEmailRetrievalRequest!: EmailRetrievalRequest;
  // Next index to begin subsequent email header retrieval from
  public nextHeaderRetrievalStartRange!: number;
  // Determines whether to show the main interface i.e EmailHeaderListComponent & EmailBodyComponent or Initial Load UI
  public showMainInterface = false;
  // Cached retrieved email bodies. This is reduce round-trips to the backend for previous loaded email bodies
  private emailBodyCache: Record<string, EmailBody> = {};
  // Stream of new email headers loaded from the backend to pass to EmailHeaderListComponent
  public newEmailHeaderList$ = new Subject<EmailHeader[]>();

  /** Determines whether to disable the ConnectionBarComponent controls.
   * Usually when a request to load email headers is in progress or there is a cached email retrieval request
   */
  public disableConnectionBarControls = false;

  /** Determine whether to display "stop" button in ConnectionBarComponent.
   * The "end" button is displayed when a succesful request/connection to the backend has been made
   * with the data emitted from the ConnectionBarComponent
   */
  public showConnectionBarStopButton = false;

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
   * @param {EmailHeader} emailHeader - Header of email whose body is to be displayed
   * @param {boolean} [displayEmailBodyInModal] - Indicates if to display the email body in a modal (usually for small size screens)
   */
  public handleDisplayEmailBodyEvent(
    emailHeader: EmailHeader,
    displayEmailBodyInModal?: boolean
  ): void {
    // Load email body for given email header
    this.loadEmailBody(emailHeader);
  }

  /**
   * Handle "stop" event from ConnectionBarComponent
   */
  public handleStopEvent(): void {
    // Flush app state
    this.flushAppState();
  }

  /**
   * Load email headers
   * @param {EmailRetrievalRequest} emailRetrievalRequest - Email retrieval request
   * @param {boolean} cacheEmailRetrievalRequest - Indicates if to cache the provided email retrieval request on successful retrieval
   * @param {number} [start] - Start index to begin loading emails from
   */
  private loadEmailHeaders(
    emailRetrievalRequest: EmailRetrievalRequest,
    cacheEmailRetrievalRequest: boolean,
    start?: number
  ): void {
    // Indicate that a request to load email headers is in progress
    this.loadingEmailHeaders = true;
    // Display the main interface (this will display the loading UI)
    this.showMainInterface = true;
    // Disable the ConnectionBarComponent controls
    this.disableConnectionBarControls = true;

    // Load email headers from backend
    this.emailService.getEmailHeaders(emailRetrievalRequest, start).subscribe(
      (emailHeaderRetrievalResponse) => {
        // Stream new email headers to EmailHeaderListComponent
        this.newEmailHeaderList$.next(emailHeaderRetrievalResponse.headerList);
        // Store next header retrieval start range
        this.nextHeaderRetrievalStartRange =
          emailHeaderRetrievalResponse.nextStartRange;
        // Indicate that a request to load email headers has ended
        this.loadingEmailHeaders = false;

        /** Show the ConnectionBarComponent "stop" button, since a succesful request/connection to the backend
         * has been made with the given email retrieval request
         */
        this.showConnectionBarStopButton = true;
        // Set isFirstEmailHeaderRequest to false, since a succesful request to load email headers has been made
        this.isFirstEmailHeaderRequest = false;

        if (cacheEmailRetrievalRequest) {
          // Cache email retrieval request for subsequent requests
          this.cachedEmailRetrievalRequest = emailRetrievalRequest;
        }
      },
      () => {
        // Indicate that a request to load email headers has ended
        this.loadingEmailHeaders = false;

        if (this.isFirstEmailHeaderRequest) {
          // Enable the ConnectionBarComponent controls, since this is the first request to load email headers and it failed
          this.disableConnectionBarControls = false;
          // Hide the main interface (this will hide the loading UI), since this is the first request to load email headers and it failed
          this.showMainInterface = false;
        }
      }
    );
  }

  /**
   * Load email body
   * @param {emailHeader} emailHeader - Header of email whose body is to be loaded
   */
  private loadEmailBody(emailHeader: EmailHeader): void {
    // Store the currently selected email header
    this.selectedEmailHeader = emailHeader;

    // Check if the email body for the current selected email header has already been loaded & cached
    const emailBodyFromCache = this.emailBodyCache[emailHeader.emailId];

    // Email body already loaded & cached
    if (emailBodyFromCache) {
      // Use email body from cache
      this.selectedEmailBody = emailBodyFromCache;
    }
    // Email body not already loaded & cached
    else {
      // Flush previously loaded email body
      this.selectedEmailBody = null as unknown as EmailBody;
      // Indicate that a request to load an email body is in progress
      this.loadingEmailBody = true;

      // Load email body from backend using cached email retrieval request and emailId
      this.emailService
        .getEmailBody(this.cachedEmailRetrievalRequest, emailHeader.emailId)
        .subscribe(
          (emailBody) => {
            // Store the loaded email body
            this.selectedEmailBody = emailBody;
            // Add the loaded email body to the cache
            this.emailBodyCache[emailHeader.emailId] = emailBody;
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

  /**
   * Flush app state.
   * 
   * Resets the app state to the pristine state.
   */
  private flushAppState(): void {
    this.loadingEmailHeaders = false;
    this.loadingEmailBody = false;
    this.isFirstEmailHeaderRequest = true;
    this.selectedEmailHeader = null as unknown as EmailHeader;
    this.selectedEmailBody = null as unknown as EmailBody;
    this.cachedEmailRetrievalRequest = null as unknown as EmailRetrievalRequest;
    this.nextHeaderRetrievalStartRange = null as unknown as number;
    this.showMainInterface = false;
    this.emailBodyCache = {};
    this.disableConnectionBarControls = false;
    this.showConnectionBarStopButton = false;
  }
}
