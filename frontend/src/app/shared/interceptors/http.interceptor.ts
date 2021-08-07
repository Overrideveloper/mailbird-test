import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  HttpInterceptor as BaseHttpInterceptor,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { ToastType } from '../model/toast.model';

@Injectable()
export class HttpInterceptor implements BaseHttpInterceptor {
  constructor(private toastService: ToastService) {}

  /**
   * Intercept HTTP requests and handle errors
   * @param {HttpRequest<any>} req - The HTTP request
   * @param {HttpHandler} next - HTTP request handler
   */
  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    req = req.clone({ withCredentials: true });

    return next.handle(req).pipe(
      catchError((error: any) => {
        // Show error toast
        if (error instanceof HttpErrorResponse) {
          this.toastService.show(
            error.error?.message ?? error.message,
            ToastType.Error
          );
        }
        return throwError(error);
      })
    );
  }
}
