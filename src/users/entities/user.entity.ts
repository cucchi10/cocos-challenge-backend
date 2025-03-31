import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 255, nullable: false })
	email: string;

	@Column({
		unique: true,
		type: 'varchar',
		length: 20,
		nullable: false,
		comment: 'This field is unique because it is the external value by which we associate the user.'
	})
	accountNumber: string;
}
