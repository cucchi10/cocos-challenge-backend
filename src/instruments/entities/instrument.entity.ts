import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AssetType } from '../../common/enums/instruments.enums';

@Entity('instruments')
export class Instrument {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'varchar',
		length: 10,
		nullable: false,
		unique: true,
		comment: 'This field is unique because it is the identifier for the instrument.'
	})
	ticker: string;

	@Column({ type: 'varchar', length: 255, nullable: false })
	name: string;

	@Column({ type: 'varchar', length: 10, nullable: false })
	type: AssetType;
}
