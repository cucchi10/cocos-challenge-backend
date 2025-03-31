import { ApiProperty } from '@nestjs/swagger';
import { validTransactionSides } from '../../../common/constants/transaction.constants';
import { OrderSides, OrderStatuses, OrderTypes } from '../../../common/enums/order.enums';
import { Instrument } from '../../../instruments/entities/instrument.entity';

export class OrderResponseDto {
	@ApiProperty({
		description: 'The unique identifier of the order.',
		example: 1
	})
	id: number;

	@ApiProperty({
		description: 'The instrument associated with the order.',
		type: Instrument
	})
	instrument: Instrument;

	@ApiProperty({
		description: 'The size of the order (quantity of the asset).',
		example: 10
	})
	size: number;

	@ApiProperty({
		description: 'The price at which the order is set.',
		example: 150.5
	})
	price: number;

	@ApiProperty({
		description: `The type of the order: ${Object.values(OrderTypes).join(', ')}.`,
		enum: OrderTypes,
		example: OrderTypes.Market
	})
	type: OrderTypes;

	@ApiProperty({
		description: `The side of the order: ${validTransactionSides.join(', ')}.`,
		enum: validTransactionSides,
		example: validTransactionSides[0]
	})
	side: OrderSides;

	@ApiProperty({
		description: `The status of the order: ${Object.values(OrderStatuses).join(', ')}.`,
		enum: OrderStatuses,
		example: OrderStatuses.New
	})
	status: OrderStatuses;

	@ApiProperty({
		description: 'The date and time when the order was created.',
		example: '2025-03-29T12:30:00Z'
	})
	datetime: Date;
}
