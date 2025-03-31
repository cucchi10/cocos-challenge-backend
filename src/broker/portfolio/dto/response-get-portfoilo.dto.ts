import { ApiProperty } from '@nestjs/swagger';
import { AssetPosition } from '../../../broker/useCase/interfaces/balance.interface';
import { IsInt, IsNumber, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AssetPositionDto implements AssetPosition {
	@ApiProperty({
		description: 'The unique identifier of the asset.',
		example: 31
	})
	@IsInt({ message: 'id must be an integer' })
	@IsPositive({ message: 'id must be a positive number' })
	id: number;

	@ApiProperty({
		description: 'The ticker symbol of the asset.',
		example: 'BMA'
	})
	@IsString({ message: 'ticker must be a string' })
	ticker: string;

	@ApiProperty({
		description: 'The name of the asset.',
		example: 'Banco Macro S.A.'
	})
	@IsString({ message: 'name must be a string' })
	name: string;

	@ApiProperty({
		description: 'The quantity of the asset held by the user.',
		example: 30
	})
	@IsInt({ message: 'quantity must be an integer' })
	@Min(0, { message: 'quantity must be at least 0' })
	quantity: number;

	@ApiProperty({
		description: 'The total value of the asset position in the portfolio.',
		example: 45084
	})
	@IsNumber({}, { message: 'positionValue must be a number' })
	@Min(0, { message: 'positionValue must be at least 0' })
	positionValue: number;

	@ApiProperty({
		description: 'The total return percentage for this asset position.',
		example: 2.1
	})
	@IsNumber({}, { message: 'totalReturn must be a number' })
	totalReturn: number;
}

export class BalanceReportDto {
	@ApiProperty({
		description: 'The total value of the user portfolio (cash + assets).',
		example: 10000
	})
	@IsNumber({}, { message: 'total must be a number' })
	@Min(0, { message: 'total must be at least 0' })
	total: number;

	@ApiProperty({
		description: 'The amount of cash available in the portfolio.',
		example: 5000
	})
	@IsNumber({}, { message: 'cash must be a number' })
	@Min(0, { message: 'cash must be at least 0' })
	cash: number;

	@ApiProperty({
		description: 'A list of assets held in the portfolio with their details.',
		type: [AssetPositionDto]
	})
	@ValidateNested({ each: true })
	@Type(() => AssetPositionDto)
	assetPositions: AssetPositionDto[];
}
