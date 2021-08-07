import { Injectable } from '@angular/core';
import { Toast, ToastType } from '../model/toast.model';

// Duration after which the toast is automatically removed
const toastTimeout = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  // List of toasts currently displayed
  public toastList: Toast[] = [];

  /**
   * Display a toast
   * @param {string} message - The message to display
   * @param {ToastType} type - The type of toast to display
   */
  public show(message: string, type: ToastType): void {
    const id = this.toastList.length;

    // Add a new toast to the list
    this.toastList.push({ id, message, type });

    // Set the timeout for the toast to be removed
    setTimeout(() => this.remove(id), toastTimeout);
  }

  /**
   * Hide/remove a toast
   * @param {number} id - The id of the toast to remove
   */
  private remove(id: number): void {
    this.toastList = this.toastList.filter((toast) => toast.id !== id);
  }
}
