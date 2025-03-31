export enum OrderStatuses {
	New = 'NEW',
	Filled = 'FILLED',
	Rejected = 'REJECTED',
	Cancelled = 'CANCELLED'
}

export enum OrderTypes {
	Market = 'MARKET',
	Limit = 'LIMIT'
}

export enum OrderSides {
	Buy = 'BUY',
	Sell = 'SELL',
	CashIn = 'CASH_IN',
	CashOut = 'CASH_OUT'
}
