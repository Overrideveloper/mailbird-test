import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Encryption } from '../shared/model/connection/encryption.enum';
import { ServerType } from '../shared/model/connection/server-type.enum';
import { EmailRetrievalRequest } from '../shared/model/email/email-retrieval-request.model';

@Component({
  selector: 'app-connection-bar',
  templateUrl: './connection-bar.component.html',
  styleUrls: ['./connection-bar.component.scss'],
})
export class ConnectionBarComponent implements OnInit, OnChanges {
  // This indicates that all form inputs/buttons should be disabled
  // Usually used when the connection is in progress
  @Input() public disableControls!: boolean;
  // This will notify the parent component to start the retrieval of headers
  @Output() private start = new EventEmitter<EmailRetrievalRequest>();
  // "Expose" the ServerType and Encryption enum values to the view
  public ServerType = ServerType;
  public Encryption = Encryption;
  // The connection form
  public connectionForm!: FormGroup;
  // This controls the connection form display
  public connectionFormDisplayed = true;

  constructor(private formBuilder: FormBuilder) {}

  public ngOnInit(): void {
    // Set up the connection form when the component is initialized
    this.setupConnectionForm();
  }

  public ngOnChanges(changes: SimpleChanges) {
    // If the disableControls value changes, handle it
    if (
      changes.disableControls &&
      !changes.disableControls.isFirstChange() &&
      changes.disableControls.currentValue !== changes.disableControls.previousValue
    ) {
      this.handleDisableControlValueChanges();
    }
  }

  /**
   * Handle the connection form submission
   */
  public submitConnectionForm(): void {
    // Ensure the form is valid
    if (this.connectionForm.valid) {
      // Emit the "start" event with the connection data
      this.start.emit(
        EmailRetrievalRequest.createFromForm(this.connectionForm.value)
      );
    }
  }

  /**
   * Toggle the connection form display
   */
  public toggleConnectionFormDisplay(): void {
    this.connectionFormDisplayed = !this.connectionFormDisplayed;
  }

  /**
   * Set up the connection form
   */
  private setupConnectionForm(): void {
    this.connectionForm = this.formBuilder.group({
      // Set up the server type input with 'IMAP' as the default value
      serverType: [ServerType.IMAP, Validators.required],
      // Set up the encryption input with 'SSL/TLS' as the default value
      encryption: [Encryption.SSL_TLS, Validators.required],
      // Set up the username input
      user: ['', Validators.required],
      // Set up the password input
      password: ['', Validators.required],
    });
  }

  /**
   * Handle disableControl value changes
   *
   * Toggle connection form control disabled state when disableControls changes
   */
  public handleDisableControlValueChanges(): void {
    Object.values(this.connectionForm.controls).forEach((control) => {
      if (this.disableControls) {
        control.disable();
      } else {
        control.enable();
      }
    });
  }
}
