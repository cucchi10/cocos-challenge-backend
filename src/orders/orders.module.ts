import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Order])],
	controllers: [],
	providers: [OrdersService],
	exports: [OrdersService]
})
export class OrdersModule {}
