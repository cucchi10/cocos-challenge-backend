import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Instrument } from '../..//instruments/entities/instrument.entity';
import { User } from '../../users/entities/user.entity';
import { OrderSides, OrderStatuses, OrderTypes } from '../../common/enums/order.enums';

@Entity('orders')
export class Order {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Instrument, (instrument) => instrument.id, { nullable: false })
	@JoinColumn({ name: 'instrumentId' })
	instrument: Instrument;

	@ManyToOne(() => User, (user) => user.id, { nullable: false })
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column({ type: 'int', nullable: false })
	size: number;

	@Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
	price: number;

	@Column({ type: 'varchar', length: 10, nullable: false })
	type: OrderTypes;

	@Column({ type: 'varchar', length: 10, nullable: false })
	side: OrderSides;

	@Column({ type: 'varchar', length: 20, nullable: false })
	status: OrderStatuses;

	@Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
	datetime: Date;
}
