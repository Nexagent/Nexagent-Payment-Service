import { PaymentStatus } from '../Status';

export interface GetPaymentsDto {
  status?: PaymentStatus;
  orderId?: string;
}
