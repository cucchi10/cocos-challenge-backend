import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { SecondaryTransactionDto } from './dto/secondary-transaction.dto';
import { UsersService } from '../../users/users.service';
import { OrdersService } from '../../orders/orders.service';
import { SearchAssetsDto } from '../assets/dto/search-assets.dto';
import { InstrumentsService } from '../../instruments/instruments.service';
import { TransactionStrategyFactory } from './strategies/transaction-strategy.factory';

@Injectable()
export class TransactionsService {
	constructor(
		private readonly usersService: UsersService,
		private readonly orderService: OrdersService,
		private readonly instrumentsService: InstrumentsService,
		private readonly transactionStrategyFactory: TransactionStrategyFactory
	) {}

	/**
	 * Retrieves the instrument ID associated with a given ticker.
	 * If no instrument is found, an error is thrown.
	 *
	 * @param {string} ticker - The ticker symbol of the instrument.
	 * @returns {Promise<number>} - A promise that resolves to the instrument ID.
	 */
	private async getInstrumentIdOrError(ticker: string) {
		return this.instrumentsService.getInstrumentIdByTicker(ticker);
	}

	/**
	 * Retrieves the user ID associated with a given account number.
	 * If no user is found, an error is thrown.
	 *
	 * @param {string} accountNumber - The account number of the user.
	 * @returns {Promise<number>} - A promise that resolves to the user ID.
	 */
	private async getUserIdOrError(accountNumber: string) {
		return this.usersService.getUserIdByAccountNumber(accountNumber);
	}

	/**
	 * Retrieves both the user ID and instrument ID for the given account number and ticker.
	 * If either the user or the instrument is not found, an error is thrown.
	 *
	 * @param {string} accountNumber - The account number of the user.
	 * @param {string} ticker - The ticker symbol of the instrument.
	 * @returns {Promise<[number, number]>} - A promise that resolves to an array containing the user ID and instrument ID.
	 */
	private async getUserIdAndInstrumentIdOrError(accountNumber: string, ticker: string) {
		return Promise.all([this.getUserIdOrError(accountNumber), this.getInstrumentIdOrError(ticker)]);
	}

	/**
	 * Retrieves market orders for a given account number based on search criteria.
	 *
	 * @param {string} accountNumber - The account number to fetch transactions for.
	 * @param {SearchAssetsDto} query - The search filters for retrieving market orders.
	 * @returns {Promise<PaginatedResponse<Order>>} - A paginated response containing a list of market orders matching the search criteria.
	 */
	async getTransactionsByAccountNumber(accountNumber: string, query: SearchAssetsDto) {
		const userId = await this.getUserIdOrError(accountNumber);

		return await this.orderService.getMarketOrdersByUserId(userId, query);
	}

	/**
	 * Creates a new transaction based on the provided details.
	 * It retrieves the user ID and instrument ID, selects the appropriate transaction strategy,
	 * and executes the transaction accordingly.
	 *
	 * @param {CreateTransactionDto} createTransactionDto - The transaction details, including account number, ticker, and order side.
	 * @returns {Promise<void>} - Resolves when the transaction is successfully executed.
	 * @throws {NotFoundException} - If the user or instrument cannot be found.
	 */
	async createTransaction(createTransactionDto: CreateTransactionDto) {
		const { accountNumber, ticker, side } = createTransactionDto;
		const [userId, instrumentId] = await this.getUserIdAndInstrumentIdOrError(accountNumber, ticker);

		const strategy = this.transactionStrategyFactory.getTransactionStrategy(side);

		return strategy.executeTransaction(userId, instrumentId, createTransactionDto);
	}

	/**
	 * Cancels a transaction based on the provided details.
	 * It retrieves the user ID, selects the appropriate secondary transaction strategy,
	 * and executes the cancellation transaction accordingly.
	 *
	 * @param {number} id - The unique identifier of the transaction to be canceled.
	 * @param {SecondaryTransactionDto} cancelTransactionDto - The cancellation details, including account number and secondary action.
	 * @returns {Promise<void>} - Resolves when the cancellation transaction is successfully executed.
	 * @throws {NotFoundException} - If the user cannot be found.
	 * @throws {BadRequestException} - If an invalid secondary action is provided for the transaction cancellation.
	 */
	async cancelTransaction(id: number, cancelTransactionDto: SecondaryTransactionDto) {
		const { accountNumber, secondaryAction } = cancelTransactionDto;
		const userId = await this.getUserIdOrError(accountNumber);

		const strategy = this.transactionStrategyFactory.getSecondaryTransactionStrategy(secondaryAction);

		return strategy.executeTransaction(userId, id, cancelTransactionDto);
	}
}
