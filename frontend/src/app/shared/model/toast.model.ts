export enum ToastType {
  Success = 'success',
  Error = 'error',
}

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
