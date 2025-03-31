import { OrderSides } from '../enums/order.enums';

// Create a subset with only the allowed values for OrderSides
export const validTransactionSides = [OrderSides.Buy, OrderSides.Sell] as const;

export type TransactionsTypes = (typeof validTransactionSides)[number];
