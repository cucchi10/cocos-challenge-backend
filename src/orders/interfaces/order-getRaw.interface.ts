import { Order } from '../entities/order.entity';

export interface OrderRaw extends Order {
	instrumentId: number;
}
