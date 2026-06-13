export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  currency?: string;
}
