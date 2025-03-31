import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { SecondaryTransactionDto } from '../dto/secondary-transaction.dto';

export interface TransactionStrategy {
	executeTransaction(userId: number, instrumentId: number, createTransactionDto: CreateTransactionDto): Promise<void>;
}

export interface SecondaryTransactionStrategy {
	executeTransaction(userId: number, orderId: number, secondaryTransactionDto: SecondaryTransactionDto): Promise<void>;
}
