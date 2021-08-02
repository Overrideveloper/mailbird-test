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
  // Indicates whether a request to load email headers is in progress
  @Input() public loading!: boolean;
  // Control whether or not to show the "load more button"
  @Input() public showLoadMoreButton!: boolean;
  // Stream of new email headers loaded from the backend
  @Input() public newEmailHeaderList$!: Subject<EmailHeader[]>;
  // This will notify the parent component to load more email headers
  @Output() private loadMoreHeaders = new EventEmitter<void>();
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
}
