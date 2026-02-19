import { OrderItem } from './order-item.model';

export interface UserOrder {
  id: string;
  order_number: string;
  order_date: string;
  status: string;
  items: OrderItem[];
}
