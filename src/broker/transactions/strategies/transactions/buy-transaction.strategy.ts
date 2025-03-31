import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { TransactionStrategy } from '../../interfaces/transaction-strategy.interface';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { BalanceService } from '../../../../broker/useCase/balance.service';
import { OrdersService } from '../../../../orders/orders.service';
import { MarketDataService } from '../../../../marketdata/marketData.service';
import { InstrumentsService } from '../../../../instruments/instruments.service';
import { OrderSides, OrderStatuses } from '../../../../common/enums/order.enums';
import { getStatusByOrderType, isLimitOrderActive } from '../../../../common/utils/transaction.helpers';
import { MoneyTicker } from '../../../../common/enums/instruments.enums';
import { getClosingPrice, hasAvailableFunds } from '../../../../common/utils/price.helpers';
import { User } from '../../../../users/entities/user.entity';
import { Instrument } from '../../../../instruments/entities/instrument.entity';

@Injectable()
export class BuyTransactionStrategy implements TransactionStrategy {
	constructor(
		private readonly balanceService: BalanceService,
		private readonly orderService: OrdersService,
		private readonly marketDataService: MarketDataService,
		private readonly instrumentService: InstrumentsService
	) {}

	/**
	 * Executes a buy transaction based on the provided details.
	 * This strategy checks if the user has enough funds and assets to proceed with the transaction.
	 * If the funds are insufficient or the assets are invalid, a rejected order is created.
	 * If the conditions are met, the necessary orders are created to complete the transaction.
	 *
	 * @param {number} userId - The ID of the user making the transaction.
	 * @param {number} instrumentId - The ID of the instrument (asset) to be bought.
	 * @param {CreateTransactionDto} createTransactionDto - The transaction details, including total amount, price, quantity, order type, and side.
	 * @returns {Promise<void>} - Resolves when the transaction is successfully executed.
	 * @throws {BadRequestException} - If the user has insufficient funds or invalid assets to complete the buy transaction.
	 * @throws {InternalServerErrorException} - If no orders were created due to a failure in the order creation process.
	 */
	async executeTransaction(userId: number, instrumentId: number, createTransactionDto: CreateTransactionDto) {
		const { totalAmount, price, quantity, orderType, side } = createTransactionDto;

		const status = getStatusByOrderType(orderType);
		const isAuctionActive = isLimitOrderActive(orderType);

		const [marketData, cash, moneyId] = await Promise.all([
			this.marketDataService.getMarketDataByInstrumentId(instrumentId),
			this.balanceService.getCashBalance(userId),
			this.instrumentService.getMoneyId(MoneyTicker.ARS)
		]);

		const { close, previousClose } = marketData;

		const purchasePrice = getClosingPrice(close, previousClose);

		const { hasFunds, isValidAssets, totalAssets, totalSpent, unitPrice } = hasAvailableFunds(
			cash,
			purchasePrice,
			quantity,
			totalAmount,
			price,
			isAuctionActive
		);

		if (!hasFunds || !isValidAssets) {
			await this.orderService.createRejectedOrder(userId, instrumentId, {
				price: unitPrice,
				size: totalAssets,
				type: orderType,
				side: side
			});

			throw new BadRequestException(
				`Order rejected due to insufficient funds. A ${orderType} order requires enough balance to cover the price of ${unitPrice} per unit.`
			);
		}

		const { identifiers } = await this.orderService.createBulkOrders([
			{
				user: { id: userId } as User,
				instrument: { id: instrumentId } as Instrument,
				price: unitPrice,
				size: totalAssets,
				type: orderType,
				side,
				status
			},
			{
				user: { id: userId } as User,
				instrument: { id: moneyId } as Instrument,
				price: totalSpent,
				type: orderType,
				size: 1,
				status: OrderStatuses.Filled,
				side: OrderSides.CashOut
			}
		]);

		if (identifiers?.length <= 0) {
			throw new InternalServerErrorException('No orders were created. Something went wrong.');
		}

		return;
	}
}
