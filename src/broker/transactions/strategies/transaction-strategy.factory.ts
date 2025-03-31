import { BadRequestException, Injectable } from '@nestjs/common';
import { SecondaryTransactionStrategy, TransactionStrategy } from '../interfaces/transaction-strategy.interface';
import { TransactionsTypes } from '../../../common/constants/transaction.constants';
import { SecondaryActions } from '../../../common/enums/transactions.enums';

@Injectable()
export class TransactionStrategyFactory {
	constructor(
		private readonly transactionStrategies: Map<TransactionsTypes, TransactionStrategy>,
		private readonly secondaryTransactionStrategies: Map<SecondaryActions, SecondaryTransactionStrategy>
	) {}

	/**
	 * Retrieves the appropriate transaction strategy based on the given transaction type.
	 *
	 * This method looks up the registered transaction strategies and returns the one that matches the provided transaction type.
	 * If no matching strategy is found, an exception is thrown.
	 *
	 * @param {TransactionsTypes} type - The type of transaction for which the strategy is required.
	 * @returns {TransactionStrategy} The corresponding transaction strategy.
	 * @throws {BadRequestException} If no strategy is found for the given transaction type.
	 */
	getTransactionStrategy(type: TransactionsTypes): TransactionStrategy {
		const strategy = this.transactionStrategies.get(type);

		if (!strategy) {
			throw new BadRequestException(`No strategy found for transaction type: ${type}. Please check the provided transaction type and try again.`);
		}

		return strategy;
	}

	/**
	 * Retrieves the appropriate secondary transaction strategy based on the given secondary action.
	 *
	 * This method looks up the registered secondary transaction strategies and returns the one that matches the provided secondary action type.
	 * If no matching strategy is found, an exception is thrown.
	 *
	 * @param {SecondaryActions} type - The type of secondary action for which the strategy is required.
	 * @returns {SecondaryTransactionStrategy} The corresponding secondary transaction strategy.
	 * @throws {BadRequestException} If no strategy is found for the given secondary action type.
	 */

	getSecondaryTransactionStrategy(type: SecondaryActions): SecondaryTransactionStrategy {
		const strategy = this.secondaryTransactionStrategies.get(type);

		if (!strategy) {
			throw new BadRequestException(`No strategy found for transaction type: ${type}. Please check the provided transaction type and try again.`);
		}

		return strategy;
	}
}
