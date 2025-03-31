import { CreateTransactionDto } from '../../broker/transactions/dto/create-transaction.dto';
import { OrderSides, OrderStatuses, OrderTypes } from '../enums/order.enums';
import { Order } from '../../orders/entities/order.entity';

/**
 * Checks if the order type is a Market order.
 *
 * @param {OrderTypes} orderTypes - The type of the order.
 * @returns {boolean} - True if the order type is Market, false otherwise.
 */
export function isMarketOrderActive(orderTypes: OrderTypes) {
	return orderTypes === OrderTypes.Market;
}

/**
 * Checks if the order type is a Limit order.
 *
 * @param {OrderTypes} orderTypes - The type of the order.
 * @returns {boolean} - True if the order type is Limit, false otherwise.
 */
export function isLimitOrderActive(orderTypes: OrderTypes) {
	return orderTypes === OrderTypes.Limit;
}

/**
 * Gets the status of the order based on the order type.
 *
 * @param {OrderTypes} orderTypes - The type of the order.
 * @returns {OrderStatuses} - Returns New status for Limit orders, or Filled status for others.
 */
export function getStatusByOrderType(orderTypes: OrderTypes) {
	return isLimitOrderActive(orderTypes) ? OrderStatuses.New : OrderStatuses.Filled;
}

/**
 * Validates the totalAmount field in the transaction DTO.
 *
 * @param {CreateTransactionDto} dto - The transaction data transfer object.
 * @returns {boolean} - Returns true if totalAmount is defined or both totalAmount and quantity are undefined.
 */
export function validateTotalAmountDto({ totalAmount, quantity }: CreateTransactionDto) {
	return (quantity === undefined && totalAmount === undefined) || totalAmount !== undefined;
}

/**
 * Validates the quantity field in the transaction DTO.
 *
 * @param {CreateTransactionDto} dto - The transaction data transfer object.
 * @returns {boolean} - Returns true if quantity is defined or both quantity and totalAmount are undefined.
 */
export function validateQuantityDto({ totalAmount, quantity }: CreateTransactionDto) {
	return (quantity === undefined && totalAmount === undefined) || quantity !== undefined;
}

/**
 * Validates the price field in the transaction DTO.
 *
 * @param {CreateTransactionDto} dto - The transaction data transfer object.
 * @returns {boolean} - Returns true if price is defined or the order type is Limit.
 */
export function validatePriceDto({ orderType, price }: CreateTransactionDto) {
	return isLimitOrderActive(orderType) || price !== undefined;
}

/**
 * Checks if the given order status is 'New'.
 *
 * @param {OrderStatuses} status - The status of the order to check.
 *
 * @returns {boolean} - `true` if the status is 'New', otherwise `false`.
 */
export function isNewStatus(status: OrderStatuses) {
	return status === OrderStatuses.New;
}

/**
 * Checks if the given order side is "Buy".
 * This helper function is used to verify if the order side is a buy order.
 *
 * @param {OrderSides} side - The side of the order, which can be either `Buy` or `Sell`.
 * @returns {boolean} - Returns `true` if the side is `Buy`, otherwise returns `false`.
 */
export function isBuySide(side: OrderSides) {
	return side === OrderSides.Buy;
}

/**
 * Validates if a transaction can be canceled based on its current status, side, and type.
 * A transaction can only be canceled if it is in "New" status, is a "Buy" order, and is a "Limit" order.
 *
 * @param {Order} order - The order to validate, containing status, side, and type.
 * @returns {boolean} - Returns `true` if the transaction can be canceled, otherwise returns `false`.
 */
export function validateCancelTransaction({ status, side, type }: Order) {
	return isNewStatus(status) && isBuySide(side) && isLimitOrderActive(type);
}
