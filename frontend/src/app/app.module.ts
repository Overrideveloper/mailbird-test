import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { AppComponent } from './app.component';
import { ConnectionBarComponent } from './connection-bar/connection-bar.component';
import { EmailHeaderListComponent } from './email-header-list/email-header-list.component';
import { EmailBodyComponent } from './email-body/email-body.component';
import { SafePipe } from './shared/pipes/safe.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ConnectionBarComponent,
    EmailHeaderListComponent,
    EmailBodyComponent,
    SafePipe,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
