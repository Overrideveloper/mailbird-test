import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { EmailHeader } from '../shared/model/email/email-header.model';

@Component({
  selector: 'app-email-header-list',
  templateUrl: './email-header-list.component.html',
  styleUrls: ['./email-header-list.component.scss'],
})
export class EmailHeaderListComponent implements OnInit, OnDestroy {
  // Indicates if a request to load email headers is in progress
  @Input() public loading!: boolean;
  // Control whether or not to show the "load more button"
  @Input() public showLoadMoreButton!: boolean;
  // Stream of new email headers loaded from the backend
  @Input() public newEmailHeaderList$!: Subject<EmailHeader[]>;
  // This will notify the parent component to load more email headers
  @Output() private loadMoreHeaders = new EventEmitter<void>();
  // This will notify the parent component to load & display the body of the clicked email header
  @Output() private displayEmailBody = new EventEmitter<EmailHeader>();
  // Current active/clicked email header
  public activeEmailHeader!: EmailHeader;
  // Current (already loaded) email header list
  public emailHeaderList!: EmailHeader[];
  // Subscription to the newEmailHeaderList$ stream
  private newEmailHeaderListSubscription!: Subscription;

  public ngOnDestroy(): void {
    // Unsubscribe from the newEmailHeaderList$ stream
    this.newEmailHeaderListSubscription?.unsubscribe();
  }

  public ngOnInit(): void {
    // Subscribe to the newEmailHeaderList$ stream
    this.subscribeToNewEmailHeaderListStream();
  }

  /**
   * Subscribe to the newEmailHeaderList$ stream
   */
  public subscribeToNewEmailHeaderListStream(): void {
    // When a new email header list is received, append it to the current email header list
    this.newEmailHeaderListSubscription = this.newEmailHeaderList$.subscribe(
      (newEmailHeaderList: EmailHeader[]) => {
        // A current email header list exists
        if (this.emailHeaderList) {
          // Append the new email header list to the current email header list
          this.emailHeaderList.push(...newEmailHeaderList);
        }
        // A current email header list does not exist
        else {
          // Set the current email header list to the new email header list
          this.emailHeaderList = newEmailHeaderList;
        }
      }
    );
  }

  /**
   * Handle click event of "load more" button
   */
  public loadMore(): void {
    // Emit the loadMoreHeaders event
    this.loadMoreHeaders.emit();
  }

  /**
   * Handle click event on an email header
   *
   * Notify the parent component to load the email body of the clicked email header
   * @param {EmailHeader} emailHeader The email header that was clicked
   */
  public emailHeaderClick(emailHeader: EmailHeader): void {
    // Set the active email header to the clicked email header
    this.activeEmailHeader = emailHeader;
    // Emit the displayEmailBody event
    this.displayEmailBody.emit(emailHeader);
  }
}
