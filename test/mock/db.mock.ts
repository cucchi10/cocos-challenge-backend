import { OrderSides, OrderStatuses, OrderTypes } from '../../src/common/enums/order.enums';
import { AssetType } from '../../src/common/enums/instruments.enums';

export const userTestMock = { email: 'userTest@test.com', accountNumber: '9999999' };
export const moneyTestMock = { ticker: 'ARS', name: 'PESOS', type: AssetType.CURRENCY };
export const AssetTestMock = { ticker: 'FERR', name: 'Ferrum S.A.', type: AssetType.STOCKS };
export const marketDataMock = [
	{ date: new Date('2025-03-27'), open: 35.8, high: 36.7, low: 34.6, close: 36.0, previousClose: 35.95 },
	{ date: new Date('2025-03-27'), open: 74.9, high: 77.0, low: 74.8, close: 77.0, previousClose: 75.0 },
	{ date: new Date('2025-03-26'), open: 101.0, high: 103.0, low: 98.0, close: 102.0, previousClose: 99.7 },
	{ date: new Date('2025-03-25'), open: 565.0, high: 565.0, low: 565.0, close: 565.0, previousClose: 565.0 },
	{ date: new Date('2025-03-24'), open: 369.65, high: 369.65, low: 356.25, close: 363.0, previousClose: 364.8 },
	{ date: new Date('2025-02-30'), open: 138.0, high: 140.0, low: 134.25, close: 138.0, previousClose: 138.0 },
	{ date: new Date('2025-02-29'), open: 1525.0, high: 1560.0, low: 1470.0, close: 1502.8, previousClose: 1520.25 },
	{ date: new Date('2025-02-25'), open: 55.0, high: 57.0, low: 55.0, close: 56.1, previousClose: 56.1 },
	{ date: new Date('2025-01-22'), open: 395.0, high: 395.0, low: 390.0, close: 392.5, previousClose: 397.5 },
	{ date: new Date('2025-01-21'), open: 295.0, high: 322.5, low: 295.0, close: 322.0, previousClose: 310.0 }
];

export const ordersAssestMock = [
	{ size: 50, price: 930, side: OrderSides.Buy, status: OrderStatuses.Filled, type: OrderTypes.Market, datetime: new Date('2023-07-12 12:31:20') },
	{ size: 50, price: 920, side: OrderSides.Buy, status: OrderStatuses.Cancelled, type: OrderTypes.Limit, datetime: new Date('2023-07-12 14:21:20') },
	{ size: 10, price: 940, side: OrderSides.Sell, status: OrderStatuses.Filled, type: OrderTypes.Market, datetime: new Date('2023-07-12 14:51:20') },
	{ size: 50, price: 710, side: OrderSides.Buy, status: OrderStatuses.New, type: OrderTypes.Limit, datetime: new Date('2023-07-12 15:14:20') },
	{
		size: 100,
		price: 950,
		side: OrderSides.Sell,
		status: OrderStatuses.Rejected,
		type: OrderTypes.Market,
		datetime: new Date('2023-07-12 16:11:20')
	},
	{ size: 60, price: 1500, side: OrderSides.Buy, status: OrderStatuses.New, type: OrderTypes.Limit, datetime: new Date('2023-07-13 11:13:20') },
	{ size: 20, price: 1540, side: OrderSides.Buy, status: OrderStatuses.Filled, type: OrderTypes.Limit, datetime: new Date('2023-07-13 12:51:20') },
	{ size: 500, price: 250, side: OrderSides.Buy, status: OrderStatuses.Filled, type: OrderTypes.Market, datetime: new Date('2023-07-13 14:11:20') },
	{ size: 30, price: 1530, side: OrderSides.Sell, status: OrderStatuses.Filled, type: OrderTypes.Market, datetime: new Date('2023-07-13 15:13:20') }
];

export const ordersMoneyMock = [
	{
		size: 1000000,
		price: 1,
		side: OrderSides.CashIn,
		status: OrderStatuses.Filled,
		type: OrderTypes.Market,
		datetime: new Date('2023-07-12 12:11:20')
	},
	{
		size: 100000,
		price: 1,
		side: OrderSides.CashOut,
		status: OrderStatuses.Filled,
		type: OrderTypes.Market,
		datetime: new Date('2023-07-13 12:31:20')
	}
];
