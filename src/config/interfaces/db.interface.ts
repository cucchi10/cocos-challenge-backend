import { DataSourceOptions } from 'typeorm';

export interface DatabaseConfig extends Omit<DataSourceOptions, 'entities' | 'migrations' | 'subscribers'> {
	type: DataSourceOptions['type'];
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	autoLoadEntities: boolean;
	synchronize: boolean;
}
