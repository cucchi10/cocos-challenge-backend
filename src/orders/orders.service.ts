import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderSides, OrderStatuses } from '../common/enums/order.enums';
import { validTransactionSides } from '../common/constants/transaction.constants';
import { SearchAssetsDto } from '../broker/assets/dto/search-assets.dto';
import { getSkip, getTotalPages } from '../common/utils/pagination.helpers';
import { PaginatedResponse } from '../common/dto/response-pagination.dto';
import { OrderRaw } from './interfaces/order-getRaw.interface';
import { CreateOrder, CreateOrderWithSideAndType, CreateOrderWithType } from './interfaces/create-order.interface';

@Injectable()
export class OrdersService {
	constructor(
		@InjectRepository(Order)
		private readonly OrderRepository: Repository<Order>
	) {}

	/**
	 * Retrieves all market orders (BUY or SELL) for a specific user.
	 * This function queries the `Order` table, joining it with the `User` table to filter orders
	 * based on the provided `userId`. It fetches all orders related to the user that are of type market (either 'BUY' or 'SELL'),
	 * including related instrument details.
	 *
	 * @param {number} userId - The ID of the user whose market orders are to be fetched.
	 *
	 * @returns {Promise<PaginatedResponseDto<Order>>} - A promise that resolves to an object containing
	 * the list of market orders belonging to the user, total count, current page, limit, and total pages.
	 *
	 */
	async getMarketOrdersByUserId(userId: number, query: SearchAssetsDto): Promise<PaginatedResponse<Order>> {
		const { page, limit } = query;
		const skip = getSkip(page, limit);

		const [result, total] = await this.OrderRepository.createQueryBuilder(Order.name)
			.innerJoin(`${Order.name}.user`, 'user')
			.leftJoinAndSelect(`${Order.name}.instrument`, 'instrument')
			.where('user.id = :userId', { userId })
			.andWhere(`${Order.name}.side IN (:...validSides)`, { validSides: validTransactionSides })
			.skip(skip)
			.take(limit)
			.getManyAndCount();

		return {
			data: result,
			total,
			page,
			limit,
			totalPages: getTotalPages(total, limit)
		};
	}

	/**
	 * Retrieves all orders with status 'FILLED' for a specific user.
	 * This function queries the `Order` table, joining it with the `User` table to filter orders
	 * based on the provided `userId`. It fetches only orders that have a status of 'FILLED'.
	 *
	 * @param {number} userId - The ID of the user whose orders with status 'FILLED' are to be fetched.
	 * @returns {Promise<Order[]>} - A promise that resolves to an array of orders with status 'FILLED' belonging to the user.
	 */
	async getFilledOrdersByUserId(userId: number) {
		return this.OrderRepository.createQueryBuilder(Order.name)
			.innerJoin(`${Order.name}.user`, 'user')
			.leftJoinAndSelect(`${Order.name}.instrument`, 'instrument')
			.where('user.id = :userId', { userId })
			.andWhere(`${Order.name}.status = :status`, {
				status: OrderStatuses.Filled
			})
			.getMany();
	}

	/**
	 * Retrieves all cash-related orders for a given user ID.
	 *
	 * This function queries the database for orders associated with the specified user
	 * where the order side is either "CashIn" or "CashOut".
	 *
	 * @param {number} userId - The ID of the user.
	 * @returns {Promise<Order[]>} A promise that resolves to an array of cash-related orders.
	 */
	async getCashOrdersByUserId(userId: number) {
		return this.OrderRepository.createQueryBuilder(Order.name)
			.innerJoin(`${Order.name}.user`, 'user')
			.leftJoinAndSelect(`${Order.name}.instrument`, 'instrument')
			.where('user.id = :userId', { userId })
			.andWhere(`${Order.name}.side IN (:...sides)`, { sides: [OrderSides.CashIn, OrderSides.CashOut] })
			.getMany();
	}

	/**
	 * Retrieves a list of unique instrument IDs for a given user, filtered by orders with status 'FILLED'.
	 * This method ensures that only orders with the 'FILLED' status are considered, and returns a distinct
	 * list of instrument IDs associated with those orders.
	 *
	 * @param {number} userId - The ID of the user whose unique instrument IDs are to be fetched.
	 * @returns {Promise<number[]>} - A promise that resolves to an array of distinct instrument IDs associated with orders that have status 'FILLED' for the given user.
	 */
	async getDistinctInstrumentIdsByUserId(userId: number): Promise<number[]> {
		const orders: OrderRaw[] = await this.OrderRepository.createQueryBuilder(Order.name)
			.innerJoin(`${Order.name}.user`, 'user')
			.select(`${Order.name}.instrumentId`)
			.distinct(true)
			.where('user.id = :userId', { userId })
			.andWhere(`${Order.name}.status = :status`, {
				status: OrderStatuses.Filled
			})
			.getRawMany();

		return orders.map(({ instrumentId }) => instrumentId);
	}

	/**
	 * Creates a new order for a user and an instrument.
	 *
	 * This method creates an order using the provided `userId`, `instrumentId`, and the order details (status, price, size, type, side).
	 * It saves the newly created order to the database.
	 *
	 * @param {number} userId - The unique identifier of the user placing the order.
	 * @param {number} instrumentId - The unique identifier of the instrument for the order.
	 * @param {CreateOrder} orderDetails - The details of the order (status, price, size, type, side).
	 *
	 * @returns {Promise<Order>} - A promise that resolves to the saved order.
	 */
	async createOrder(userId: number, instrumentId: number, { status, price, size, type, side }: CreateOrder) {
		const order = this.OrderRepository.create({
			user: { id: userId },
			instrument: { id: instrumentId },
			price,
			size,
			type,
			side,
			status
		});
		return this.OrderRepository.save(order);
	}

	/**
	 * Creates a rejected order for a user and an instrument.
	 *
	 * This method sets the status to `Rejected` and calls `createOrder` to save the order.
	 *
	 * @param {number} userId - The unique identifier of the user placing the order.
	 * @param {number} instrumentId - The unique identifier of the instrument for the order.
	 * @param {CreateOrderWithSideAndType} order - The details of the order, including `side` and `type`.
	 *
	 * @returns {Promise<Order>} - A promise that resolves to the saved rejected order.
	 */
	async createRejectedOrder(userId: number, instrumentId: number, order: CreateOrderWithSideAndType) {
		const status = OrderStatuses.Rejected;
		return this.createOrder(userId, instrumentId, { ...order, status });
	}

	/**
	 * Creates a filled order for a user and an instrument.
	 *
	 * This method sets the status to `Filled` and calls `createOrder` to save the order.
	 *
	 * @param {number} userId - The unique identifier of the user placing the order.
	 * @param {number} instrumentId - The unique identifier of the instrument for the order.
	 * @param {CreateOrderWithSideAndType} order - The details of the order, including `side` and `type`.
	 *
	 * @returns {Promise<Order>} - A promise that resolves to the saved filled order.
	 */
	async createFilledOrder(userId: number, instrumentId: number, order: CreateOrderWithSideAndType) {
		const status = OrderStatuses.Filled;
		return this.createOrder(userId, instrumentId, { ...order, status });
	}

	/**
	 * Creates a new order for a user and an instrument.
	 *
	 * This method sets the status to `New` and calls `createOrder` to save the order.
	 *
	 * @param {number} userId - The unique identifier of the user placing the order.
	 * @param {number} instrumentId - The unique identifier of the instrument for the order.
	 * @param {CreateOrderWithSideAndType} order - The details of the order, including `side` and `type`.
	 *
	 * @returns {Promise<Order>} - A promise that resolves to the saved new order.
	 */
	async createNewOrder(userId: number, instrumentId: number, order: CreateOrderWithSideAndType) {
		const status = OrderStatuses.New;
		return this.createOrder(userId, instrumentId, { ...order, status });
	}

	/**
	 * Creates a cash-out order for a user and an instrument.
	 *
	 * This method sets the status to `Filled` and the side to `CashOut`, then calls `createOrder` to save the order.
	 *
	 * @param {number} userId - The unique identifier of the user placing the order.
	 * @param {number} instrumentId - The unique identifier of the instrument for the order.
	 * @param {CreateOrderWithType} order - The details of the order, including `type`.
	 *
	 * @returns {Promise<Order>} - A promise that resolves to the saved cash-out order.
	 */
	async createCashOutOrder(userId: number, instrumentId: number, order: CreateOrderWithType) {
		const status = OrderStatuses.Filled;
		const side = OrderSides.CashOut;
		return this.createOrder(userId, instrumentId, { ...order, status, side });
	}

	/**
	 * Creates multiple orders in bulk and inserts them into the database.
	 *
	 * This function allows you to create multiple orders at once and insert them into the database.
	 * Each order must be a partial Order object, containing the necessary fields like price, size, type, etc.
	 *
	 * @param orders - An array of order data to be inserted. Each order should have fields like price, size, type, and any other necessary properties.
	 *
	 * @returns A response with the identifiers of the successfully created orders.
	 */
	async createBulkOrders(orders: Partial<Order>[]) {
		return this.OrderRepository.insert(orders);
	}

	/**
	 * Retrieves all filled orders for a specific user and instrument.
	 *
	 * This method queries the `OrderRepository` to find all orders that have the status `Filled`, for the provided `userId` and `instrumentId`.
	 * It includes the relationships with the `user` and `instrument` entities and selects only the relevant fields: `size` and `side`.
	 *
	 * @param {number} userId - The unique identifier of the user for whom the orders are being retrieved.
	 * @param {number} instrumentId - The unique identifier of the instrument for which the filled orders are being fetched.
	 *
	 * @returns {Promise<Order[]>} - A promise that resolves to an array of filled orders, including `size` and `side` fields.
	 */
	async getFilledOrdersByUserIdAndInstrumentId(userId: number, instrumentId: number) {
		return this.OrderRepository.find({
			where: {
				status: OrderStatuses.Filled,
				user: { id: userId },
				instrument: { id: instrumentId }
			},
			relations: ['user', 'instrument'],
			select: ['size', 'side']
		});
	}

	/**
	 * Retrieves an order by its ID and the user's ID.
	 * Throws an error if no order is found for the given IDs.
	 *
	 * @param {number} id - The ID of the order.
	 * @param {number} userId - The ID of the user associated with the order.
	 *
	 * @returns {Promise<Order>} - The order associated with the given IDs.
	 *
	 * @throws {NotFoundException} - If no order is found for the given ID and user ID.
	 */

	async getOrderByIdAndUserId(id: number, userId: number) {
		const order = await this.OrderRepository.findOne({ where: { id, user: { id: userId } }, relations: ['instrument'] });
		if (!order) {
			throw new NotFoundException('Order not found for the given ID and user ID.');
		}
		return order;
	}
}
