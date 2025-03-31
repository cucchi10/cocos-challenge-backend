import { BadRequestException, Injectable } from '@nestjs/common';
import {
	calculateAdjustedQuantity,
	calculateAmountAdjustment,
	calculateTotalReturn,
	getClosingPrice,
	getNewTotalReturn,
	isCash,
	isPositiveNumber,
	sumAmounts
} from '../../common/utils/price.helpers';
import { MarketDataService } from '../../marketdata/marketData.service';
import { Order } from '../../orders/entities/order.entity';
import { OrdersService } from '../../orders/orders.service';
import { AssetPosition, Balance } from './interfaces/balance.interface';
import { MarketData } from '../../marketdata/entities/marketData.entity';
import { BalanceReportDto } from '../portfolio/dto/response-get-portfoilo.dto';

@Injectable()
export class BalanceService {
	constructor(
		private readonly orderService: OrdersService,
		private readonly marketDataService: MarketDataService
	) {}

	/**
	 * Retrieves the market data for a given instrument based on its ID from the provided market data array.
	 *
	 * This function looks for the instrument in the `instrumentsInfo` array, matching the `instrument.id` with the provided `instrumentId`.
	 * If the instrument is not found, a `BadRequestException` is thrown with an appropriate error message.
	 *
	 * @param {MarketData[]} instrumentsInfo - The array of market data objects containing information about various instruments.
	 * @param {number} instrumentId - The ID of the instrument whose market data is being fetched.
	 * @returns {MarketData} - The market data object corresponding to the given instrument ID.
	 * @throws {BadRequestException} - Throws an exception if no market data is found for the specified instrument ID.
	 */
	private getMarketData(instrumentsInfo: MarketData[], instrumentId: number) {
		const marketData = instrumentsInfo.find(({ instrument }) => instrument.id === instrumentId);

		if (!marketData) {
			throw new BadRequestException(
				`Market data not found for instrument with ID: ${instrumentId}. Ensure that all instruments have corresponding market data.`
			);
		}

		return marketData;
	}

	/**
	 * Calculates and groups the asset positions based on a list of orders and associated market data.
	 * This function processes each order, calculates its position value, total return, and adjusted quantity,
	 * and then groups the asset positions by instrument ID.
	 *
	 * For each order:
	 * - If the order type is 'cash', it is ignored.
	 * - Market data is retrieved using the `getMarketData` function.
	 * - The closing price is calculated using the `getClosingPrice` function.
	 * - Position value is adjusted using the `calculateAmountAdjustment` function.
	 * - Total return is calculated using the `calculateTotalReturn` function.
	 * - Quantity is adjusted using the `calculateAdjustedQuantity` function.
	 *
	 * The resulting asset positions are grouped by instrument ID, with the quantity, position value,
	 * and total return being accumulated across orders of the same instrument.
	 *
	 * @param {Order[]} orders - The list of orders containing information such as size, price, side, and instrument details.
	 * @param {MarketData[]} instrumentsInfo - The list of market data for instruments, used to get closing prices.
	 * @returns {AssetPosition[]} - An array of grouped asset positions, each containing instrument ID, ticker, name, quantity, position value, and total return.
	 */
	private getAssetPositions(orders: Order[], instrumentsInfo: MarketData[]) {
		const groupAsset = orders.reduce<Record<number, AssetPosition>>((result, orders) => {
			const {
				size,
				price,
				side,
				instrument: { id: instrumentId, type, ticker, name }
			} = orders;

			if (isCash(type)) {
				return result;
			}

			const { close, previousClose } = this.getMarketData(instrumentsInfo, instrumentId);

			const closePrice = getClosingPrice(close, previousClose);

			const positionValue = calculateAmountAdjustment(side, closePrice, size);

			const totalReturn = calculateTotalReturn(closePrice, price);

			const quantity = calculateAdjustedQuantity(side, size);

			if (!result[instrumentId]) {
				result[instrumentId] = {
					id: instrumentId,
					ticker,
					name,
					quantity,
					positionValue,
					totalReturn
				};
			} else {
				const newQuantity = sumAmounts(result[instrumentId].quantity, quantity);

				result[instrumentId].quantity = newQuantity;

				const newPositionValue = sumAmounts(result[instrumentId].positionValue, positionValue);

				result[instrumentId].positionValue = newPositionValue;

				const oldTotalReturn = result[instrumentId].totalReturn;

				result[instrumentId].totalReturn = getNewTotalReturn(oldTotalReturn, totalReturn);
			}

			return result;
		}, {});

		return Object.values(groupAsset).filter(({ quantity }) => isPositiveNumber(quantity));
	}

	/**
	 * Calculates the balance of orders, separating cash and other assets (e.g., stocks or instruments).
	 *
	 * This function iterates through a list of orders, checking the type of each order's instrument (either `CURRENCY` or `STOCKS`).
	 * It calculates the amount for each order using the `calculateAmountAdjustment` function and sums the results into two categories:
	 * - **cash**: the total value of `CURRENCY` type assets.
	 * - **assets**: the total value of non-currency assets (such as `STOCKS` or other instruments).
	 *
	 * The result is an object of type `Balance` containing the total amounts for both `cash` and `assets`.
	 *
	 * @param {Order[]} orders - The list of orders to calculate the balance for.
	 * @returns {Balance} An object of type `Balance` containing the total balances for `cash` and `assets`:
	 * - `cash` (number): The total value of cash (currency-based orders).
	 * - `assets` (number): The total value of non-cash assets (e.g., stocks).
	 *
	 */
	private getBalance(orders: Order[]): Balance {
		return orders.reduce(
			(result, order) => {
				const {
					side,
					price,
					size,
					instrument: { type }
				} = order;

				const total = calculateAmountAdjustment(side, price, size);

				if (isCash(type)) {
					const newCash = sumAmounts(result.cash, total);
					result.cash = newCash;
				} else {
					const newAssets = sumAmounts(result.assets, total);
					result.assets = newAssets;
				}

				return result;
			},
			{ assets: 0, cash: 0 }
		);
	}

	/**
	 * Retrieves the valid orders and associated instrument IDs for a specific user.
	 * This method calls two different services:
	 * 1. `getFilledOrdersByUserId` to fetch filled orders for the given user.
	 * 2. `getDistinctInstrumentIdsByUserId` to fetch distinct instrument IDs associated with the valid orders of the user.
	 *
	 * The method executes both services in parallel using `Promise.all`, and returns a promise that resolves to an array with two elements:
	 * - The first element is an array of filled orders for the user.
	 * - The second element is an array of distinct instrument IDs associated with the valid orders.
	 *
	 * @param {number} userId - The ID of the user for whom valid orders and instrument IDs are to be retrieved.
	 *
	 * @returns {Promise<[Order[], number[]]>} - A promise that resolves to a tuple:
	 *   - An array of `Order` entities representing the filled orders.
	 *   - An array of instrument IDs associated with the user's valid orders.
	 */
	private async getValidOrdersAndInstrumentIds(userId: number) {
		return Promise.all([this.orderService.getFilledOrdersByUserId(userId), this.orderService.getDistinctInstrumentIdsByUserId(userId)]);
	}

	/**
	 * Retrieves the market data for a list of instruments identified by their IDs.
	 * This method calls the `getMarketDataByInstrumentIds` service to fetch market data for the given instrument IDs.
	 *
	 * @param {number[]} instrumentsId - An array of instrument IDs for which market data is to be retrieved.
	 *
	 * @returns {Promise<MarketData[]>} - A promise that resolves to an array of `MarketData` entities, each containing the market information for the corresponding instrument.
	 */
	private async getMarketDataByInstrumentIds(instrumentsId: number[]) {
		return this.marketDataService.getMarketDataByInstrumentIds(instrumentsId);
	}

	/**
	 * Retrieves the portfolio balance information for a user, including the total portfolio value (cash + assets), available weight for trading,
	 * and a list of assets held by the user with the quantity, total monetary value, and performance return.
	 *
	 * This method calculates the total portfolio value, available cash for trading, and provides detailed information
	 * on each asset held in the user's portfolio, including its quantity, total monetary value, and return on investment.
	 *
	 * The portfolio calculation is based on the user's valid orders, the associated instruments, and the latest market data.
	 *
	 * @param {number} userId - The unique identifier of the user whose portfolio balance is being retrieved.
	 *
	 * @returns {Promise<BalanceReportDto>} - A promise that resolves to a `BalanceReport` object containing:
	 *   - `total`: The total portfolio value (sum of cash and asset value).
	 *   - `cash`: The total amount of cash available in the user's portfolio.
	 *   - `assetPositions`: A list of assets held by the user, each with its:
	 *     - `id`: The asset's unique identifier.
	 *     - `ticker`: The asset's ticker symbol.
	 *     - `name`: The asset's name.
	 *     - `quantity`: The amount of the asset held by the user.
	 *     - `positionValue`: The total monetary value of the asset position.
	 *     - `totalReturn`: The total performance return percentage of the asset.
	 */
	async getPortfolio(userId: number): Promise<BalanceReportDto> {
		// Step 1: Retrieve valid orders and associated instrument IDs
		const [orders, instrumentsId] = await this.getValidOrdersAndInstrumentIds(userId);

		// Step 2: Retrieve the market data for the instruments
		const instrumentsInfo = await this.getMarketDataByInstrumentIds(instrumentsId);

		// Step 3: Calculate the balance and asset positions
		const { cash, assets } = this.getBalance(orders);

		const total = sumAmounts(cash, assets);

		// Get the asset positions
		const assetPositions = this.getAssetPositions(orders, instrumentsInfo);

		return { total, cash, assetPositions };
	}

	/**
	 * Retrieves the user's cash balance by calculating the total cash value from their orders.
	 *
	 * This function first fetches all cash-related orders for the given user by calling `getCashOrdersByUserId`.
	 * Then, it calculates the user's balance by passing the retrieved orders to `getBalance`,
	 * and returns the calculated cash balance.
	 *
	 * @param {number} userId - The unique identifier of the user whose cash balance is to be retrieved.
	 * @returns {Promise<number>} - A promise that resolves to the user's cash balance.
	 */
	async getCashBalance(userId: number) {
		const orders = await this.orderService.getCashOrdersByUserId(userId);

		const { cash } = this.getBalance(orders);

		return cash;
	}

	/**
	 * Calculates the total quantity of available orders for a user based on their order list.
	 * This function reduces the list of orders and calculates the available quantity
	 * according to the side of the order (buy/sell).
	 *
	 * @param {Order[]} orders - An array of `Order` objects containing the `size` and `side` properties.
	 * @returns {number} The total adjusted quantity of available orders.
	 */
	getDisponibleOrders(orders: Order[]) {
		return orders.reduce((result, { size, side }) => {
			const total = calculateAdjustedQuantity(side, size);
			const newValue = sumAmounts(result, total);

			return newValue;
		}, 0);
	}

	/**
	 * Retrieves the available stocks for a user based on their filled orders for a specific instrument.
	 * This function queries the order service for filled orders of the user and instrument,
	 * then calculates the total available stocks using `getDisponibleOrders`.
	 *
	 * @param {number} userId - The ID of the user for whom the available stocks are being retrieved.
	 * @param {number} instrumentId - The ID of the instrument for which the available stocks are being retrieved.
	 * @returns {Prom../ise<number>} The total available stocks for the user for the specified instrument.
	 */
	async getAvailableStocks(userId: number, instrumentId: number) {
		const orders = await this.orderService.getFilledOrdersByUserIdAndInstrumentId(userId, instrumentId);

		return this.getDisponibleOrders(orders);
	}
}
