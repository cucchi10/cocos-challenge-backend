import { Instrument } from '../../instruments/entities/instrument.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('marketData')
export class MarketData {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Instrument, (instrument) => instrument.id, { nullable: false })
	@JoinColumn({ name: 'instrumentId' })
	instrument: Instrument;

	@Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
	high: number;

	@Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
	low: number;

	@Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
	open: number;

	@Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
	close: number;

	@Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
	previousClose: number;

	@Column({ type: 'date', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
	date: Date;
}
