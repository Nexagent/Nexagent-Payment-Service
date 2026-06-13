import { PaymentStatus } from './Status';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}
