import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min, ValidateIf } from 'class-validator';
import { TransactionsTypes, validTransactionSides } from '../../../common/constants/transaction.constants';
import { OrderTypes } from '../../../common/enums/order.enums';
import { validatePriceDto, validateQuantityDto, validateTotalAmountDto } from '../../../common/utils/transaction.helpers';

export class CreateTransactionDto {
	@ApiProperty({
		description: 'The account number associated with the transaction to cancel.',
		example: '123456'
	})
	@IsString({ message: 'Account number must be a string.' })
	@IsNotEmpty({ message: 'Account number is required and cannot be empty.' })
	accountNumber: string;

	@ApiProperty({
		description: 'The ticker symbol of the asset.',
		example: 'BMA'
	})
	@IsString({ message: 'ticker must be a string' })
	ticker: string;

	@ApiProperty({
		description: `The type of the order: (${Object.values(OrderTypes).join(', ')}).`,
		enum: OrderTypes,
		example: OrderTypes.Market
	})
	@IsEnum(OrderTypes, { message: `orderType must be one of the following values: ${Object.values(OrderTypes).join(', ')}` })
	@IsNotEmpty({ message: 'orderType must not be empty' })
	orderType: OrderTypes;

	@ApiProperty({
		description: 'The total amount of the order.',
		example: 100.5,
		required: false
	})
	@ValidateIf((orderDto) => validateTotalAmountDto(orderDto as CreateTransactionDto))
	@IsDefined({ message: `totalAmount is required if quantity is not provided.` })
	@IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 }, { message: 'totalAmount must be a valid number' })
	@IsNotEmpty({ message: 'totalAmount must not be empty' })
	@Min(1, { message: 'totalAmount must be greater than 0' })
	totalAmount?: number;

	@ApiProperty({
		description: 'The quantity of the asset to be transacted.',
		example: 100
	})
	@ValidateIf((orderDto) => validateQuantityDto(orderDto as CreateTransactionDto))
	@IsDefined({ message: `quantity is required when the order type is ${OrderTypes.Market} or if totalAmount is not provided.` })
	@IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 }, { message: 'quantity must be a valid number' })
	@IsNotEmpty({ message: 'quantity must not be empty' })
	@Min(1, { message: 'quantity must be greater than 0' })
	@Max(1_000_000, { message: 'quantity exceeds the allowed limit of 1_000_000' })
	quantity?: number;

	@ApiPropertyOptional({
		description: `The price at which the order should be executed (required for ${OrderTypes.Limit} orders).`,
		type: Number,
		required: false,
		example: 150.5
	})
	@ValidateIf((orderDto) => validatePriceDto(orderDto as CreateTransactionDto))
	@IsDefined({ message: `price is required when the order type is ${OrderTypes.Limit}` })
	@IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 }, { message: 'price must be a valid number' })
	@Min(0, { message: 'price must be a positive number' })
	@Max(99_999_999, { message: 'price exceeds the allowed limit of 99_999_999.00' })
	price?: number;

	@ApiProperty({
		description: 'Indicates if the order is a buy or sell transaction.',
		enum: validTransactionSides,
		example: validTransactionSides[0]
	})
	@IsEnum(validTransactionSides, {
		message: `Side must be one of the following values: ${validTransactionSides.join(', ')}`
	})
	@IsNotEmpty({ message: 'Side must not be empty' })
	side: TransactionsTypes;
}
