import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataService } from './marketData.service';
import { MarketData } from './entities/marketData.entity';

@Module({
	imports: [TypeOrmModule.forFeature([MarketData])],
	controllers: [],
	providers: [MarketDataService],
	exports: [MarketDataService]
})
export class MarketDataModule {}
