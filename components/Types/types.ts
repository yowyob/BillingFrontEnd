export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// This is what the hook will return
export type ToastContextType = (message: string, type?: ToastType) => void;