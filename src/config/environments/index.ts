import { configDotenv } from 'dotenv';

configDotenv();
import * as Joi from 'joi';
import { Environment } from '../../common/enums/environments.enums';

export const configuration = () => {
	const { API_PORT, API_SCOPE, API_PREFIX_VERSION, API_VERSION, DB_TYPE, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SSL } =
		process.env;

	return {
		db: {
			type: DB_TYPE,
			host: DB_HOST,
			port: DB_PORT,
			username: DB_USERNAME,
			password: DB_PASSWORD,
			database: DB_DATABASE,
			autoLoadEntities: false,
			synchronize: true,
			...(DB_HOST !== 'localhost' && {
				ssl: {
					rejectUnauthorized: DB_SSL
				}
			})
		},

		api: {
			port: API_PORT,
			scope: API_SCOPE,
			apiPrefixVersion: `api/${API_PREFIX_VERSION}`,
			prefixVersion: API_PREFIX_VERSION,
			version: API_VERSION
		}
	};
};

export const validationSchema = Joi.object({
	API_PORT: Joi.number().default(3000),
	API_SCOPE: Joi.string()
		.valid(...Object.values(Environment))
		.default(Environment.DEVELOPMENT),
	API_PREFIX_VERSION: Joi.string().default('v1'),
	API_VERSION: Joi.string().default('1.0.0'),
	DB_TYPE: Joi.string().valid('postgres').default('postgres'),
	DB_HOST: Joi.string().default('localhost'),
	DB_PORT: Joi.number().default(5432),
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_DATABASE: Joi.string().default('cocos-capital'),
	DB_SSL: Joi.boolean().default(false)
});
