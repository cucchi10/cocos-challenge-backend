import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { TransactionStrategy } from '../../interfaces/transaction-strategy.interface';
import { getStatusByOrderType, isLimitOrderActive } from '../../../../common/utils/transaction.helpers';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { BalanceService } from '../../../../broker/useCase/balance.service';
import { OrdersService } from '../../../../orders/orders.service';
import { MarketDataService } from '../../../../marketdata/marketData.service';
import { InstrumentsService } from '../../../../instruments/instruments.service';
import { MoneyTicker } from '../../../../common/enums/instruments.enums';
import { calculateAssetsSale, getClosingPrice, isPositiveNumber } from '../../../../common/utils/price.helpers';
import { User } from '../../../../users/entities/user.entity';
import { Instrument } from '../../../../instruments/entities/instrument.entity';
import { OrderSides, OrderStatuses } from '../../../../common/enums/order.enums';

@Injectable()
export class SellTransactionStrategy implements TransactionStrategy {
	constructor(
		private readonly balanceService: BalanceService,
		private readonly orderService: OrdersService,
		private readonly marketDataService: MarketDataService,
		private readonly instrumentService: InstrumentsService
	) {}

	/**
	 * Executes a sell transaction for the given user and instrument, ensuring the user has enough available stock and
	 * creating the necessary orders based on the provided transaction details.
	 *
	 * The function checks the user's balance to ensure they have sufficient stock to sell, creates rejected orders if necessary,
	 * retrieves market data and calculates the sale price and total amount, then creates orders to sell the assets and transfer the obtained funds.
	 *
	 * @param {number} userId - The unique identifier of the user performing the transaction.
	 * @param {number} instrumentId - The unique identifier of the instrument being sold.
	 * @param {CreateTransactionDto} createTransactionDto - The details of the transaction, including total amount, price, quantity, order type, and side.
	 *
	 * @returns {Promise<void>} - Resolves when the transaction is successfully executed.
	 * @throws {BadRequestException} - If the user does not have sufficient stock available to complete the sale order.
	 * @throws {InternalServerErrorException} - If no orders were created due to an internal error.
	 */

	async executeTransaction(userId: number, instrumentId: number, createTransactionDto: CreateTransactionDto) {
		const { totalAmount, price, quantity, orderType, side } = createTransactionDto;

		const ownedAssets = await this.balanceService.getAvailableStocks(userId, instrumentId);

		if (!isPositiveNumber(ownedAssets) || (isPositiveNumber(quantity) && quantity > ownedAssets)) {
			await this.orderService.createRejectedOrder(userId, instrumentId, {
				price: price ?? 0,
				size: quantity ?? 0,
				type: orderType,
				side: side
			});

			throw new BadRequestException(`Insufficient stock available to complete the sale order. Please ensure there are enough assets to proceed.`);
		}

		const status = getStatusByOrderType(orderType);
		const isAuctionActive = isLimitOrderActive(orderType);

		const [marketData, moneyId] = await Promise.all([
			this.marketDataService.getMarketDataByInstrumentId(instrumentId),
			this.instrumentService.getMoneyId(MoneyTicker.ARS)
		]);

		const { close, previousClose } = marketData;

		const purchasePrice = getClosingPrice(close, previousClose);

		const { totalAssetsToSell, totalAmountObtained, sellPrice } = calculateAssetsSale(
			ownedAssets,
			purchasePrice,
			totalAmount,
			quantity,
			price,
			isAuctionActive
		);

		const { identifiers } = await this.orderService.createBulkOrders([
			{
				user: { id: userId } as User,
				instrument: { id: instrumentId } as Instrument,
				price: sellPrice,
				size: totalAssetsToSell,
				type: orderType,
				side,
				status
			},
			{
				user: { id: userId } as User,
				instrument: { id: moneyId } as Instrument,
				price: totalAmountObtained,
				type: orderType,
				size: 1,
				status: OrderStatuses.Filled,
				side: OrderSides.CashIn
			}
		]);

		if (identifiers?.length <= 0) {
			throw new InternalServerErrorException('No orders were created. Something went wrong.');
		}

		return;
	}
}
