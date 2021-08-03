import { Component, Input } from '@angular/core';
import { EmailBody } from '../shared/model/email/email-body.model';
import { EmailHeader } from '../shared/model/email/email-header.model';

@Component({
  selector: 'app-email-body',
  templateUrl: './email-body.component.html',
  styleUrls: ['./email-body.component.scss'],
})
export class EmailBodyComponent {
  // Indicates if a request to load an email body is in progress
  @Input() public loading!: boolean;
  // Header of the loaded email body
  @Input() public emailHeader!: EmailHeader;
  // The loaded email body
  @Input() public emailBody!: EmailBody;
}
