import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration, validationSchema } from './config/environments';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { OrdersModule } from './orders/orders.module';
import { MarketDataModule } from './marketdata/marketData.module';
import { BrokerModule } from './broker/broker.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [configuration],
			validationSchema,
			isGlobal: true
		}),
		DatabaseModule,
		UsersModule,
		InstrumentsModule,
		OrdersModule,
		MarketDataModule,
		BrokerModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
