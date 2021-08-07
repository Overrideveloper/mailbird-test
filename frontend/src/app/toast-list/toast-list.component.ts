import { trigger, transition, style, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { ToastType } from '../shared/model/toast.model';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-toast-list',
  templateUrl: './toast-list.component.html',
  styleUrls: ['./toast-list.component.scss'],
  animations: [
    trigger('toastInOut', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate(
          '500ms ease-out',
          style({
            opacity: 1,
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
        }),
        animate(
          '500ms ease-in',
          style({
            opacity: 0,
          })
        ),
      ]),
    ]),
  ],
})
export class ToastListComponent {
  // Expose the ToastType enum to the template
  public ToastType = ToastType;
  constructor(public toastService: ToastService) {}
}
