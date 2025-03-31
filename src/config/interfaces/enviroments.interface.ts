import { ApiConfig } from './api.interface';
import { DatabaseConfig } from './db.interface';

export interface Config {
	db: DatabaseConfig;
	api: ApiConfig;
}
