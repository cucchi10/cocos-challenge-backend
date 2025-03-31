import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SecondaryTransactionDto } from '../../dto/secondary-transaction.dto';
import { SecondaryTransactionStrategy } from '../../interfaces/transaction-strategy.interface';
import { OrdersService } from '../../../../orders/orders.service';
import { validateCancelTransaction } from '../../../../common/utils/transaction.helpers';
import { OrderSides, OrderStatuses, OrderTypes } from '../../../../common/enums/order.enums';
import { User } from '../../../../users/entities/user.entity';
import { Instrument } from '../../../../instruments/entities/instrument.entity';
import { MoneyTicker } from '../../../../common/enums/instruments.enums';
import { InstrumentsService } from '../../../../instruments/instruments.service';
import { calculateTotalAmount } from '../../../../common/utils/price.helpers';

@Injectable()
export class CancelTransactionStrategy implements SecondaryTransactionStrategy {
	private logger = new Logger(CancelTransactionStrategy.name);
	constructor(
		private readonly orderService: OrdersService,
		private readonly instrumentsService: InstrumentsService
	) {}

	/**
	 * Executes the transaction cancellation for a given order by creating the necessary orders to handle the cancellation.
	 *
	 * This method checks if the order meets the necessary conditions for cancellation (status is 'New', side is 'Buy', and order type is 'Limit').
	 * If the conditions are met, the order is cancelled, and a corresponding 'CashIn' order is created. If the order is rejected,
	 * it throws a `BadRequestException`. It also handles logging and any internal errors that may occur during the process.
	 *
	 * @param {number} userId - The ID of the user who owns the order.
	 * @param {number} orderId - The ID of the order to be cancelled.
	 * @param {SecondaryTransactionDto} reason - An object that may contain a reason for the cancellation.
	 * @throws {BadRequestException} Throws an exception if the transaction cannot be canceled due to missing conditions.
	 * @throws {InternalServerErrorException} Throws an exception if there is an issue creating the necessary orders.
	 * @returns {void} This function doesn't return any value.
	 */
	async executeTransaction(userId: number, orderId: number, { reason }: SecondaryTransactionDto) {
		this.logger.debug(`Canceling transaction ID ${orderId} for user ID ${userId} with${reason ? ` reason: ${reason}` : 'out a reason'}`);

		const order = await this.orderService.getOrderByIdAndUserId(orderId, userId);

		if (!validateCancelTransaction(order)) {
			throw new BadRequestException(
				`Transaction can only be canceled if it is in '${OrderStatuses.New}' status, with ${OrderSides.Buy} side and ${OrderTypes.Limit} order type.`
			);
		}
		const moneyId = await this.instrumentsService.getMoneyId(MoneyTicker.ARS);

		const {
			side,
			type,
			size,
			price,
			instrument: { id: instrumentId }
		} = order;

		const { identifiers } = await this.orderService.createBulkOrders([
			{
				user: { id: userId } as User,
				instrument: { id: instrumentId } as Instrument,
				price,
				size,
				type,
				side,
				status: OrderStatuses.Cancelled
			},
			{
				user: { id: userId } as User,
				instrument: { id: moneyId } as Instrument,
				price: calculateTotalAmount(price, size),
				type,
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
