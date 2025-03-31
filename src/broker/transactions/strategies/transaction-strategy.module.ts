import { Module } from '@nestjs/common';
import { TransactionsTypes } from '../../../common/constants/transaction.constants';
import { BuyTransactionStrategy } from './transactions/buy-transaction.strategy';
import { CancelTransactionStrategy } from './transactions/cancel-transaction.strategy';
import { TransactionStrategyFactory } from './transaction-strategy.factory';
import { SecondaryTransactionStrategy, TransactionStrategy } from '../interfaces/transaction-strategy.interface';
import { OrderSides } from '../../../common/enums/order.enums';
import { UseCaseModule } from '../../../broker/useCase/useCase.module';
import { SellTransactionStrategy } from './transactions/sell-transaction.strategy';
import { OrdersModule } from '../../../orders/orders.module';
import { MarketDataModule } from '../../../marketdata/marketData.module';
import { InstrumentsModule } from '../../../instruments/instruments.module';
import { SecondaryActions } from '../../../common/enums/transactions.enums';

@Module({
	imports: [UseCaseModule, OrdersModule, MarketDataModule, InstrumentsModule],
	providers: [
		BuyTransactionStrategy,
		SellTransactionStrategy,
		CancelTransactionStrategy,
		{
			provide: TransactionStrategyFactory,
			useFactory: (buy: BuyTransactionStrategy, sell: SellTransactionStrategy, cancel: CancelTransactionStrategy) => {
				const map = new Map<TransactionsTypes, TransactionStrategy>();

				map.set(OrderSides.Buy, buy);
				map.set(OrderSides.Sell, sell);

				const secondaryMap = new Map<SecondaryActions, SecondaryTransactionStrategy>();

				secondaryMap.set(SecondaryActions.Cancel, cancel);

				return new TransactionStrategyFactory(map, secondaryMap);
			},
			inject: [BuyTransactionStrategy, SellTransactionStrategy, CancelTransactionStrategy]
		}
	],
	exports: [TransactionStrategyFactory]
})
export class TransactionStrategyFactoryModule {}
