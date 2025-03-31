import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { UsersModule } from '../../users/users.module';
import { OrdersModule } from '../../orders/orders.module';
import { TransactionStrategyFactoryModule } from './strategies/transaction-strategy.module';
import { InstrumentsModule } from '../../instruments/instruments.module';

@Module({
	imports: [UsersModule, OrdersModule, InstrumentsModule, TransactionStrategyFactoryModule],
	controllers: [TransactionsController],
	providers: [TransactionsService]
})
export class TransactionsModule {}
