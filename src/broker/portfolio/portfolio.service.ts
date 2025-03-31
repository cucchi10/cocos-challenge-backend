import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { BalanceService } from '../useCase/balance.service';

@Injectable()
export class PortfolioService {
	constructor(
		private readonly usersService: UsersService,
		private readonly balanceService: BalanceService
	) {}

	/**
	 * Retrieves the user ID associated with a given account number.
	 * If no user is found, an error is thrown.
	 *
	 * @param {string} accountNumber - The account number of the user.
	 * @returns {Promise<string>} - A promise that resolves to the user ID.
	 */
	private async getUserIdOrError(accountNumber: string) {
		return this.usersService.getUserIdByAccountNumber(accountNumber);
	}

	/**
	 * Retrieves the user's portfolio balance based on the provided account number.
	 *
	 * @param {string} accountNumber - The account number associated with the user.
	 * @returns {Promise<Balance>} - The user's portfolio balance.
	 * @throws {Error} - If the user ID cannot be retrieved.
	 */
	async getPortfolio(accountNumber: string) {
		const userId = await this.getUserIdOrError(accountNumber);

		const balance = await this.balanceService.getPortfolio(userId);

		return balance;
	}
}
