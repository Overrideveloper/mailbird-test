import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { AppComponent } from './app.component';
import { ConnectionBarComponent } from './connection-bar/connection-bar.component';
import { EmailHeaderListComponent } from './email-header-list/email-header-list.component';
import { EmailBodyComponent } from './email-body/email-body.component';
import { SafePipe } from './shared/pipes/safe.pipe';
import { ToastListComponent } from './toast-list/toast-list.component';
import { HttpInterceptor } from './shared/interceptors/http.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    ConnectionBarComponent,
    EmailHeaderListComponent,
    EmailBodyComponent,
    SafePipe,
    ToastListComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
