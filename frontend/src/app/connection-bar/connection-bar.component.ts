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
  styleUrls: [],
})
export class ConnectionBarComponent implements OnInit, OnChanges {
  // Indicates that all form inputs/buttons should be disabled
  @Input() public disableForm!: boolean;
  // Indicates that the stop button should be displayed
  @Input() public showStopButton: boolean = false;
  // This will notify the parent component to start the retrieval of headers
  @Output() private start = new EventEmitter<EmailRetrievalRequest>();
  // This will notify the parent component to stop and reset
  @Output() private stop = new EventEmitter<void>();
  // "Expose" the ServerType and Encryption enum values to the template
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
    // If the disableForm value changes, handle it
    if (
      changes.disableForm &&
      !changes.disableForm.isFirstChange() &&
      changes.disableForm.currentValue !== changes.disableForm.previousValue
    ) {
      this.handleDisableFormValueChanges();
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
   * Handle the click event of the "stop" button
   */
  public end(): void {
    // Emit the "stop" event
    this.stop.emit();
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
   * Handle disableForm value changes
   *
   * Toggle connection form control disabled state when disableForm changes
   */
  public handleDisableFormValueChanges(): void {
    Object.values(this.connectionForm.controls).forEach((control) => {
      if (this.disableForm) {
        control.disable();
      } else {
        control.enable();
      }
    });
  }
}
