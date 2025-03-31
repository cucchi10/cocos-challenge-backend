import { BadRequestException } from '@nestjs/common';
import { sideToMultiplier } from '../constants/portfolio.constants';
import { OrderSides } from '../enums/order.enums';
import { AssetType } from '../enums/instruments.enums';
import { AssetSellInfo, FundsAvailability, TotalAssetsSpent } from '../interfaces/price.interface';

/**
 * Calculates the total amount by multiplying the given amount and total values, then rounding the result down to two decimal places.
 *
 * The function multiplies the two numeric input values, scales the result by 100 to shift the decimal point, applies `Math.floor()` to round
 * down to the nearest integer, and then divides by 100 to return the result with two decimal places.
 *
 * @param {number} amount - The amount value to be multiplied.
 * @param {number} total - The total value to multiply the amount by.
 * @returns {number} The calculated total amount, rounded down to two decimal places.
 */
export function calculateTotalAmount(amount: number, total: number): number {
	return Math.floor(amount * total * 100) / 100;
}

/**
 * Calculates the sum of two amounts and rounds the result down to two decimal places.
 *
 * This function ensures precision when adding monetary values by scaling the sum by 100,
 * applying `Math.floor()` to round down, and then dividing by 100 to maintain two decimal places.
 *
 * @param {number} amountA - The first amount to be added.
 * @param {number} amountB - The second amount to be added.
 * @returns {number} The total amount, rounded down to two decimal places.
 */
export function sumAmounts(amountA: number, amountB: number): number {
	return Math.floor((amountA + amountB) * 100) / 100;
}

/**
 * Returns the multiplier for the given order side type.
 *
 * This function takes an order side type (e.g., BUY, SELL, CASH_IN, CASH_OUT) and returns the corresponding multiplier.
 * The multiplier is `1` for BUY and SELL sides, and `-1` for CASH_IN and CASH_OUT sides.
 *
 * @param {OrderSides} type - The side of the order (Buy, Sell, CashIn, CashOut).
 * @throws {BadRequestException} If the provided side is invalid or not recognized.
 * @returns {number} The multiplier corresponding to the provided side type.
 */
function getMultipler(type: OrderSides) {
	const multipler = sideToMultiplier[type];

	if (multipler === undefined) {
		throw new BadRequestException(
			`Invalid order side type provided: ${type} Please ensure the side is one of: ${Object.values(OrderSides).join(', ')}`
		);
	}

	return multipler;
}

/**
 * Calculates the amount adjustment based on the order side, price, and size.
 *
 * This function computes the total amount based on the provided price and size, and adjusts it by applying
 * a multiplier according to the order side type (BUY, SELL, CASH_IN, or CASH_OUT).
 * The adjustment is either positive or negative, depending on the side of the order.
 *
 * - For "BUY" and "CASH_IN" sides, the multiplier is positive, meaning the amount is added.
 * - For "SELL" and "CASH_OUT" sides, the multiplier is negative, meaning the amount is subtracted.
 *
 * @param {OrderSides} side - The side of the order (BUY, SELL, CASH_IN, CASH_OUT).
 * @param {number} price - The price per unit of the instrument.
 * @param {number} size - The quantity or size of the instrument being traded.
 * @throws {BadRequestException} If the provided side is invalid or not recognized.
 * @returns {number} The adjusted amount after applying the multiplier for the order side.
 */
export function calculateAmountAdjustment(side: OrderSides, price: number, size: number): number {
	const amount = calculateTotalAmount(price, size);

	const multipler = getMultipler(side);

	return multipler * amount;
}

/**
 * Checks if the given asset type is of type `CURRENCY`.
 *
 * This function takes an asset type as input and returns `true` if the asset type
 * is classified as `CURRENCY` (representing cash or currency-related assets).
 * Otherwise, it returns `false`.
 *
 * @param {AssetType} type - The asset type to check.
 * @returns {boolean} `true` if the asset type is `CURRENCY`, otherwise `false`.
 */
export function isCash(type: AssetType) {
	return type === AssetType.CURRENCY;
}

/**
 * Returns the closing price.
 * If the current closing price is not provided (`null` or `undefined`), it falls back to the previous closing price.
 *
 * @param { string |number | null | undefined} close - The current closing price.
 * @param { string | number} previousClose - The previous closing price.
 * @returns {number} - The valid closing price.
 */
export function getClosingPrice(close: string | number | null | undefined, previousClose: string | number): number {
	return Number(close ?? previousClose);
}

/**
 * Calculates the total return percentage based on the executed price and the closing price.
 *
 * @param {number} closingPrice - The latest available closing price of the asset.
 * @param {number} executedPrice - The price at which the order was executed.
 * @returns {number} - The total return percentage.
 */
export function calculateTotalReturn(closingPrice: number, executedPrice: number): number {
	if (executedPrice === 0) {
		return 0;
	}

	const totalReturn = ((closingPrice - executedPrice) / executedPrice) * 100;

	return Math.round(totalReturn * 100) / 100;
}

/**
 * Adjusts the quantity based on the order side.
 * This function adjusts the quantity by applying a multiplier according to the order side (BUY, SELL, etc.).
 *
 * - For "BUY" and "CASH_IN" sides, the multiplier is positive, meaning the quantity is added.
 * - For "SELL" and "CASH_OUT" sides, the multiplier is negative, meaning the quantity is subtracted.
 *
 * @param {OrderSides} side - The side of the order (BUY, SELL, CASH_IN, CASH_OUT).
 * @param {number} size - The quantity or size of the instrument being traded.
 * @throws {BadRequestException} If the provided side is invalid or not recognized.
 * @returns {number} - The adjusted quantity.
 */
export function calculateAdjustedQuantity(side: OrderSides, size: number): number {
	const multiplier = getMultipler(side);

	return multiplier * size;
}

/**
 * Calculates the new total return based on the old total return and the new total return.
 *
 * @param {number} oldTotalReturn - The existing total return for the asset.
 * @param {number} totalReturn - The new total return to be added to the existing return.
 * @returns {number} - The new total return after combining the old and new total returns.
 */
export function getNewTotalReturn(oldTotalReturn: number, totalReturn: number): number {
	const result = (oldTotalReturn + totalReturn) / 2;
	return Math.round(result * 100) / 100;
}

/**
 * Checks if a value is a positive number.
 *
 * @param {unknown} number - The value to be checked.
 * @returns {boolean} - Returns true if the value is a positive number, false otherwise.
 */
export function isPositiveNumber(number: unknown): number is number {
	return !!number && typeof number === 'number' && number > 0;
}

/**
 * Calculates the total number of assets (e.g., stocks) that can be purchased
 * with the available amount of money, and the total amount of money spent.
 *
 * @param {number} purchasePrice - The price of one asset (e.g., stock).
 * @param {number} availableAmount - The total amount of money available to spend on the assets.
 * @returns An object containing:
 *   - `totalAssets`: The total number of assets that can be purchased.
 *   - `totalSpent`: The total amount of money spent on the assets.
 */
function calculateTotalAssets(purchasePrice: number, availableAmount: number): TotalAssetsSpent {
	const totalAssets = Math.floor(availableAmount / purchasePrice);

	const totalSpent = calculateTotalAmount(purchasePrice, totalAssets);

	return {
		totalAssets,
		totalSpent
	};
}

/**
 * Function to check if there are available funds to purchase assets based on different inputs.
 *
 * The purchase can be determined by the quantity of assets, price per asset, or total amount.
 * The function calculates the total cost based on the available inputs and compares it to the available cash.
 * If an auction is active, the provided price will be used instead of the default market purchase price.
 *
 * @param {number} cash - The available cash to make the purchase.
 * @param {number} purchasePrice - The default market price per asset.
 * @param {number | undefined} quantity - The quantity of assets to purchase.
 * @param {number | undefined} totalAmount - The total amount to spend on the purchase.
 * @param {number | undefined} price - The price per asset if different from the default `purchasePrice`.
 * @param {boolean} isAuctionActive - Determines if the purchase follows a client-defined price (auction)
 * or the default market price.
 *
 * @returns {FundsAvailability} - The result of the funds availability check, including total assets,
 * total spent, the unit price used, and whether the purchase is valid based on available funds.
 *
 * @throws {BadRequestException} - If no valid inputs are provided (quantity, price, or totalAmount).
 */
export function hasAvailableFunds(
	cash: number,
	purchasePrice: number,
	quantity: number | undefined,
	totalAmount: number | undefined,
	price: number | undefined,
	isAuctionActive: boolean
): FundsAvailability {
	if (!isPositiveNumber(quantity) && !isPositiveNumber(price) && !isPositiveNumber(totalAmount)) {
		throw new BadRequestException('Invalid input provided. Quantity, price, and totalAmount must be positive numbers.');
	}

	let total = quantity;
	let unitPrice = isAuctionActive ? price : purchasePrice;
	let amount = totalAmount;

	// Case 1: If neither quantity nor price are provided, but totalAmount is provided, calculate based on totalAmount
	if (total === undefined && unitPrice === undefined) {
		const { totalAssets, totalSpent } = calculateTotalAssets(purchasePrice, amount!);
		total = totalAssets;
		amount = totalSpent;
		unitPrice = purchasePrice;
	}
	// Case 2: If both quantity and price are provided, calculate the total amount based on the quantity and price
	else if (total !== undefined && unitPrice !== undefined) {
		const totalAmountCalculated = calculateTotalAmount(unitPrice, total);
		const { totalAssets, totalSpent } = calculateTotalAssets(unitPrice, totalAmountCalculated);
		total = totalAssets;
		amount = totalSpent;
	}
	// Case 3: If quantity is provided but price is not, use purchasePrice as the unit price
	else if (total !== undefined && unitPrice === undefined) {
		const totalAmountCalculated = calculateTotalAmount(purchasePrice, total);
		const { totalAssets, totalSpent } = calculateTotalAssets(purchasePrice, totalAmountCalculated);
		total = totalAssets;
		amount = totalSpent;
		unitPrice = purchasePrice;
	}
	// Case 4: If price and totalAmount are provided, but quantity is not, calculate the assets and total based on those inputs
	else if (total === undefined) {
		const { totalAssets, totalSpent } = calculateTotalAssets(unitPrice!, totalAmount!);
		total = totalAssets;
		amount = totalSpent;
	}

	const hasFunds = cash >= amount!;

	const isValidAssets = isPositiveNumber(total);

	return {
		hasFunds,
		isValidAssets,
		unitPrice: unitPrice!,
		totalAssets: isValidAssets ? total : 0,
		totalSpent: amount!
	};
}

/**
 * Function to calculate the maximum number of assets that can be sold based on available cash.
 *
 * @param {number} ownedAssets - The number of assets the user owns.
 * @param {number} sellPrice - The price per asset.
 * @param {number | undefined} cash - The amount of cash available for the sale.
 *
 * @returns {AssetSellInfo} - An object containing the total number of assets the user can sell and the total amount to be obtained.
 */
export function calculateMaxAssetsSellable(ownedAssets: number, sellPrice: number, cash: number | undefined): AssetSellInfo {
	let totalAssetsToSell = ownedAssets;

	if (isPositiveNumber(cash)) {
		const maxAssets = Math.floor(cash / sellPrice);

		if (totalAssetsToSell > maxAssets) {
			totalAssetsToSell = maxAssets;
		}
	}

	const totalAmountObtained = calculateTotalAmount(sellPrice, totalAssetsToSell);

	return {
		totalAssetsToSell,
		totalAmountObtained,
		sellPrice
	};
}

/**
 * Function to calculate the number of assets that can be sold based on available funds.
 * It handles various scenarios where either the quantity, price, or total amount is provided,
 * and calculates the maximum number of assets that can be sold along with the amount obtained.
 *
 * If `isAuctionActive` is `true`, the sale is made at a client-defined price (auction).
 * If `false`, the sale follows the market price.
 *
 * @param {number} ownedAssets - The number of assets the user currently owns.
 * @param {number} sellPrice - The default market price per asset.
 * @param {number | undefined} totalAmount - The total amount of money the user wants to get from the sale.
 * @param {number | undefined} quantity - The number of assets the user intends to sell.
 * @param {number | undefined} price - The price per asset if different from the default `sellPrice`.
 * @param {boolean} isAuctionActive - Determines if the sale follows a client-defined price (auction) or the market price.
 *
 * @returns {AssetSellInfo} - An object containing the total quantity of assets to be sold,
 * the total amount obtained, and the unit price used for the sale.
 *
 * @throws {BadRequestException} - If none of the inputs (quantity, price, or totalAmount) are valid positive numbers.
 */
export function calculateAssetsSale(
	ownedAssets: number,
	sellPrice: number,
	totalAmount: number | undefined,
	quantity: number | undefined,
	price: number | undefined,
	isAuctionActive: boolean
): AssetSellInfo {
	if (!isPositiveNumber(quantity) && !isPositiveNumber(price) && !isPositiveNumber(totalAmount)) {
		throw new BadRequestException('Invalid input provided. Quantity, price, and totalAmount must be positive numbers.');
	}

	let unitPrice = isAuctionActive ? price : sellPrice;
	let amount = totalAmount;

	// Case 1: If neither quantity nor price is provided, but totalAmount is given, calculate the max assets to sell based on totalAmount
	if (quantity === undefined && unitPrice === undefined && amount !== undefined) {
		return calculateMaxAssetsSellable(ownedAssets, sellPrice, amount);
	}
	// Case 2: If quantity is provided but not price, calculate the total amount from quantity and use the default sellPrice
	else if (unitPrice === undefined && quantity !== undefined) {
		unitPrice = sellPrice; // Use sellPrice as the default price per asset
		amount = calculateTotalAmount(unitPrice, quantity);
	}
	// Case 3: If totalAmount is provided but quantity is not, calculate the max assets to sell based on totalAmount
	else if (quantity === undefined && amount !== undefined && unitPrice !== undefined) {
		return calculateMaxAssetsSellable(ownedAssets, unitPrice, amount);
	}
	// Case 4: If both quantity and price are provided, calculate the total amount and validate if the sale is possible
	else if (quantity !== undefined && unitPrice !== undefined) {
		amount = calculateTotalAmount(unitPrice, quantity);
	}

	return calculateMaxAssetsSellable(ownedAssets, unitPrice!, amount);
}
