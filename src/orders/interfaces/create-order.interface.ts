import { OrderSides, OrderStatuses, OrderTypes } from '../../common/enums/order.enums';

export interface CreateOrderBase {
	price: number;
	size: number;
}

export interface CreateOrderWithType extends CreateOrderBase {
	type: OrderTypes;
}

export interface CreateOrderWithSideAndType extends CreateOrderWithType {
	side: OrderSides;
}

export interface CreateOrder extends CreateOrderWithSideAndType {
	status: OrderStatuses;
}
