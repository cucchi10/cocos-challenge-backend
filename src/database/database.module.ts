import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/interfaces/db.interface';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Instrument } from '../instruments/entities/instrument.entity';
import { MarketData } from '../marketdata/entities/marketData.entity';

@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) =>
				({
					...configService.get<DatabaseConfig>('db')!,
					entities: [User, Order, Instrument, MarketData]
				}) as TypeOrmModuleOptions,
			inject: [ConfigService]
		})
	]
})
export class DatabaseModule {}
