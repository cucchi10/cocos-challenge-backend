import { OrderSides } from '../enums/order.enums';

export const sideToMultiplier: Record<OrderSides, 1 | -1> = {
	[OrderSides.Buy]: 1,
	[OrderSides.Sell]: -1,
	[OrderSides.CashIn]: 1,
	[OrderSides.CashOut]: -1
};
