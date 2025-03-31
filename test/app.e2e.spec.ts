/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CreateTransactionDto } from '../src/broker/transactions/dto/create-transaction.dto';
import { OrderSides, OrderStatuses, OrderTypes } from '../src/common/enums/order.enums';
import { SecondaryTransactionDto } from '../src/broker/transactions/dto/secondary-transaction.dto';
import { SecondaryActions } from '../src/common/enums/transactions.enums';
import { OrderResponseDto } from '../src/broker/transactions/dto/response-get-transactions.dto';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Instrument } from '../src/instruments/entities/instrument.entity';
import { Order } from '../src/orders/entities/order.entity';
import { MarketData } from '../src/marketdata/entities/marketData.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AssetTestMock, marketDataMock, moneyTestMock, ordersAssestMock, ordersMoneyMock, userTestMock } from './mock/db.mock';
import { PaginatedResponse } from '../src/common/dto/response-pagination.dto';
import { configuration, validationSchema } from '../src/config/environments';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseConfig } from '../src/config/interfaces/db.interface';
import { join } from 'path';
import { readFileSync } from 'fs';

describe('TransactionsController (e2e)', () => {
	let dataSource: DataSource;
	let app: INestApplication<App>;

	let lastNewOrderId: number;
	let secondNewOrderId: number;
	let lastFilledOrderId: number;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		const moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					load: [configuration],
					validationSchema,
					isGlobal: true
				}),
				TypeOrmModule.forRootAsync({
					imports: [ConfigModule],
					useFactory: (configService: ConfigService) =>
						({
							...configService.get<DatabaseConfig>('db')!,
							entities: [MarketData, Instrument, User, Order],
							synchronize: true,
							dropSchema: true
						}) as TypeOrmModuleOptions,
					inject: [ConfigService]
				})
			]
		}).compile();
		dataSource = moduleRef.get(DataSource);

		const { id: userId } = await dataSource.getRepository(User).save(userTestMock);
		const { id: moneyId } = await dataSource.getRepository(Instrument).save(moneyTestMock);
		const { id: instrumentId } = await dataSource.getRepository(Instrument).save(AssetTestMock);

		await dataSource.getRepository(MarketData).save(
			marketDataMock.map((m) => ({
				...m,
				instrument: { id: instrumentId } as Instrument
			}))
		);

		await dataSource.getRepository(Order).save(
			ordersAssestMock.map((o) => ({
				...o,
				user: { id: userId } as User,
				instrument: { id: instrumentId } as Instrument
			}))
		);

		await dataSource.getRepository(Order).save(
			ordersMoneyMock.map((o) => ({
				...o,
				user: { id: userId } as User,
				instrument: { id: moneyId } as Instrument
			}))
		);

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix('/api/v1');
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
		await app.init();
	}, 60000);

	afterAll(async () => {
		await dataSource.dropDatabase();

		const sqlFilePath = join(__dirname, '../docs/database/database.sql');
		const sqlQuery = readFileSync(sqlFilePath, 'utf8');

		await dataSource.query(sqlQuery);
		await dataSource.destroy();
		await app.close();
	}, 60000);

	describe('POST /transactions [ MARKET - BUY ]', () => {
		it('should create a new Market transaction with totalAmount', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Market,
				totalAmount: 100.5,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});

		it('should create a new Market transaction with quantity', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Market,
				quantity: 1,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});

		it('should return 400 when creating a Market transaction without totalAmount or quantity', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Market,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', [
				'totalAmount is required if quantity is not provided.',
				'totalAmount must be greater than 0',
				'totalAmount must not be empty',
				'totalAmount must be a valid number',
				'quantity is required when the order type is MARKET or if totalAmount is not provided.',
				'quantity exceeds the allowed limit of 1_000_000',
				'quantity must be greater than 0',
				'quantity must not be empty',
				'quantity must be a valid number'
			]);
		});

		it('should return 404 for invalid USER', async () => {
			const invalidTransaction: CreateTransactionDto = {
				accountNumber: 'False123',
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Market,
				totalAmount: 100.5,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(invalidTransaction);
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message', 'No user found with the provided account number: False123');
		});
	});

	describe('POST /transactions [ MARKET - SELL ]', () => {
		it('should create a new SELL Market transaction successfully with quantity', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Market,
				quantity: 1,
				side: OrderSides.Sell
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});

		it('should create a new SELL Market transaction successfully with totalAmount', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Market,
				totalAmount: 100.5,
				side: OrderSides.Sell
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});

		it('should return 400 when creating a SELL Market transaction without totalAmount or quantity', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Market,
				side: OrderSides.Sell
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', [
				'totalAmount is required if quantity is not provided.',
				'totalAmount must be greater than 0',
				'totalAmount must not be empty',
				'totalAmount must be a valid number',
				'quantity is required when the order type is MARKET or if totalAmount is not provided.',
				'quantity exceeds the allowed limit of 1_000_000',
				'quantity must be greater than 0',
				'quantity must not be empty',
				'quantity must be a valid number'
			]);
		});
	});

	describe('POST /transactions [ LIMIT - BUY ]', () => {
		it('should create a new BUY Limit transaction successfully with price and totalAmount', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				totalAmount: 100.5,
				price: 1,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto);

			expect(response.status).toBe(201);
		});

		it('should create a new BUY Limit transaction successfully with quantity', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				quantity: 1,
				price: 1,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});

		it('should return 400 for BUY Limit transaction without totalAmount or quantity and price', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', [
				'totalAmount is required if quantity is not provided.',
				'totalAmount must be greater than 0',
				'totalAmount must not be empty',
				'totalAmount must be a valid number',
				'quantity is required when the order type is MARKET or if totalAmount is not provided.',
				'quantity exceeds the allowed limit of 1_000_000',
				'quantity must be greater than 0',
				'quantity must not be empty',
				'quantity must be a valid number',
				'price is required when the order type is LIMIT',
				'price exceeds the allowed limit of 99_999_999.00',
				'price must be a positive number',
				'price must be a valid number'
			]);
		});

		it('should return 400 for BUY Limit transaction when only price is provided, without totalAmount or quantity', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				price: 5,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', [
				'totalAmount is required if quantity is not provided.',
				'totalAmount must be greater than 0',
				'totalAmount must not be empty',
				'totalAmount must be a valid number',
				'quantity is required when the order type is MARKET or if totalAmount is not provided.',
				'quantity exceeds the allowed limit of 1_000_000',
				'quantity must be greater than 0',
				'quantity must not be empty',
				'quantity must be a valid number'
			]);
		});

		it('should create a new BUY Limit transaction successfully with price and quantity', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				price: 150.5,
				quantity: 10,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});

		it('should create a new BUY Limit transaction successfully with price and totalAmount', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				price: 150.5,
				totalAmount: 1505,
				side: OrderSides.Buy
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});
	});

	describe('POST /transactions [ LIMIT - SELL ]', () => {
		it('should create a new SELL Limit transaction successfully with price and quantity', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				price: 150.5,
				quantity: 10,
				side: OrderSides.Sell
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});
		it('should create a new SELL Limit transaction successfully with price and totalAmount', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				price: 150.5,
				totalAmount: 1505,
				side: OrderSides.Sell
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto).expect(201);

			expect(response.status).toBe(201);
		});
		it('should return 400 when creating a SELL Limit transaction without quantity or totalAmount', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				price: 150.5,
				side: OrderSides.Sell
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto);
			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', [
				'totalAmount is required if quantity is not provided.',
				'totalAmount must be greater than 0',
				'totalAmount must not be empty',
				'totalAmount must be a valid number',
				'quantity is required when the order type is MARKET or if totalAmount is not provided.',
				'quantity exceeds the allowed limit of 1_000_000',
				'quantity must be greater than 0',
				'quantity must not be empty',
				'quantity must be a valid number'
			]);
		});
		it('should return 400 for SELL Limit transaction with quantity but without price', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				quantity: 10,
				side: OrderSides.Sell
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', [
				'price is required when the order type is LIMIT',
				'price exceeds the allowed limit of 99_999_999.00',
				'price must be a positive number',
				'price must be a valid number'
			]);
		});

		it('should return 400 for SELL Limit transaction without price, quantity, and totalAmount', async () => {
			const createTransactionDto: CreateTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				ticker: AssetTestMock.ticker,
				orderType: OrderTypes.Limit,
				side: OrderSides.Sell
			};

			const response = await request(app.getHttpServer()).post('/api/v1/broker/transactions').send(createTransactionDto);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', [
				'totalAmount is required if quantity is not provided.',
				'totalAmount must be greater than 0',
				'totalAmount must not be empty',
				'totalAmount must be a valid number',
				'quantity is required when the order type is MARKET or if totalAmount is not provided.',
				'quantity exceeds the allowed limit of 1_000_000',
				'quantity must be greater than 0',
				'quantity must not be empty',
				'quantity must be a valid number',
				'price is required when the order type is LIMIT',
				'price exceeds the allowed limit of 99_999_999.00',
				'price must be a positive number',
				'price must be a valid number'
			]);
		});
	});

	describe('GET /transactions/account/:accountNumber', () => {
		it('should return a list of transactions for a valid account number', async () => {
			const response: { body: PaginatedResponse<OrderResponseDto> } = await request(app.getHttpServer())
				.get(`/api/v1/broker/transactions/account/${userTestMock.accountNumber}`)
				.expect(200);

			expect(response.body.data[0]).toMatchObject({
				id: expect.any(Number),
				type: expect.stringMatching(/^(MARKET|LIMIT)$/),
				side: expect.stringMatching(/^(BUY|SELL)$/),
				datetime: expect.any(String)
			});

			expect(Object.values(OrderTypes)).toContain(response.body.data[0].type);
			expect(Object.values(OrderSides)).toContain(response.body.data[0].side);

			lastNewOrderId = response.body.data.find(({ status }) => status === OrderStatuses.New)!.id;
			secondNewOrderId = response.body.data.find(({ status, id }) => status === OrderStatuses.New && id !== lastNewOrderId)!.id;

			lastFilledOrderId = response.body.data.find(({ status }) => status === OrderStatuses.Filled)!.id;
		});

		it('should return 404 if account number is not found', async () => {
			const response = await request(app.getHttpServer()).get('/api/v1/broker/transactions/account/000000');
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message', 'No user found with the provided account number: 000000');
		});
	});

	describe('DELETE /transactions/cancel/:id', () => {
		it('should cancel a transaction successfully', async () => {
			const cancelTransactionDto: SecondaryTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				secondaryAction: SecondaryActions.Cancel
			};

			const response = await request(app.getHttpServer()).delete(`/api/v1/broker/transactions/cancel/${lastNewOrderId}`).send(cancelTransactionDto);

			expect(response.status).toBe(201);
		});

		it('should return 404 if transaction is not found', async () => {
			const response = await request(app.getHttpServer())
				.delete('/api/v1/broker/transactions/cancel/9999')
				.send({ accountNumber: userTestMock.accountNumber, secondaryAction: SecondaryActions.Cancel });

			expect(response.body).toHaveProperty('message', 'Order not found for the given ID and user ID.');
			expect(response.status).toBe(404);
		});

		it('should return 400 for invalid request', async () => {
			const response = await request(app.getHttpServer()).delete(`/api/v1/broker/transactions/cancel/${secondNewOrderId}`).send({});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', [
				'Account number is required and cannot be empty.',
				'Account number must be a string.',
				'Secondary operation type is required.',
				'Operation type must be one of the following: CANCEL'
			]);
		});

		it('should return 404 if userId is incorrect for secondNewOrderId', async () => {
			const cancelTransactionDto: SecondaryTransactionDto = {
				accountNumber: '000000',
				secondaryAction: SecondaryActions.Cancel
			};

			const response = await request(app.getHttpServer()).delete(`/api/v1/broker/transactions/cancel/${secondNewOrderId}`).send(cancelTransactionDto);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message', 'No user found with the provided account number: 000000');
		});

		it('should return 400 if order has an incorrect status for lastFilledOrderId', async () => {
			const cancelTransactionDto: SecondaryTransactionDto = {
				accountNumber: userTestMock.accountNumber,
				secondaryAction: SecondaryActions.Cancel
			};

			const response = await request(app.getHttpServer())
				.delete(`/api/v1/broker/transactions/cancel/${lastFilledOrderId}`)
				.send(cancelTransactionDto);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				'message',
				`Transaction can only be canceled if it is in 'NEW' status, with BUY side and LIMIT order type.`
			);
		});
	});
});
