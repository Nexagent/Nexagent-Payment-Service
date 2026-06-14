import { OrderItem } from '../Item';

export interface CreateOrderDto {
  customerId: string;
  items: OrderItem[];
}
