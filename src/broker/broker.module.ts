import { Module } from '@nestjs/common';
import { InstrumentsModule } from '../instruments/instruments.module';
import { UsersModule } from '../users/users.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AssetsModule } from './assets/assets.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
	imports: [InstrumentsModule, UsersModule, PortfolioModule, AssetsModule, TransactionsModule]
})
export class BrokerModule {}
