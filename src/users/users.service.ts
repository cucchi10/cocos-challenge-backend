import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly UserRepository: Repository<User>
	) {}

	/**
	 * Retrieves the user ID by their account number.
	 *
	 * This method searches for a user in the database based on the provided account number.
	 * If the user is found, it returns the user's ID. If no user is found with the given account number,
	 * it throws a `NotFoundException` with the message "User not found".
	 *
	 * @param {string} accountNumber - The account number of the user to search for.
	 * @returns {Promise<number>} - A promise that resolves to the user's ID if found.
	 * @throws {NotFoundException} - If no user is found with the provided account number.
	 */
	async getUserIdByAccountNumber(accountNumber: string): Promise<number> {
		const user = await this.UserRepository.findOne({ where: { accountNumber }, select: ['id'] });

		if (!user) {
			throw new NotFoundException(`No user found with the provided account number: ${accountNumber}`);
		}

		return user.id;
	}
}
