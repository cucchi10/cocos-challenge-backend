import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { OrdersModule } from '../../orders/orders.module';
import { MarketDataModule } from '../../marketdata/marketData.module';

@Module({
	imports: [OrdersModule, MarketDataModule],
	providers: [BalanceService],
	exports: [BalanceService]
})
export class UseCaseModule {}
