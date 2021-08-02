import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Encryption } from '../shared/model/connection/encryption.enum';
import { ServerType } from '../shared/model/connection/server-type.enum';

@Component({
  selector: 'app-connection-bar',
  templateUrl: './connection-bar.component.html',
  styleUrls: ['./connection-bar.component.scss'],
})
export class ConnectionBarComponent implements OnInit {
  // "Expose" the ServerType and Encryption enum values to the view
  public ServerType = ServerType;
  public Encryption = Encryption;
  // The connection form
  public connectionForm!: FormGroup;
  // This will notify the parent component to initiate a connection with the given connection data
  @Output() private connect = new EventEmitter<any>();

  constructor(private formBuilder: FormBuilder) {}

  public ngOnInit(): void {
    // Set up the connection form when the component is initialized
    this.setupConnectionForm();
  }

  /**
   * Handle the connection form submission
   */
  public submitConnectionForm(): void {
    // Ensure the form is valid
    if (this.connectionForm.valid) {
      // This will notify the parent component to initiate a connection with the connection form data
      this.connect.emit(this.connectionForm.value);
    }
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
}
