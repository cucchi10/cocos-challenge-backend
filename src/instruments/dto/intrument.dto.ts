import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Length, IsEnum } from 'class-validator';
import { AssetType } from '../../common/enums/instruments.enums';

export class InstrumentDto {
	@ApiProperty({
		description: 'The unique identifier of the instrument.',
		example: 1
	})
	@IsInt()
	id: number;

	@ApiProperty({
		description: 'The ticker symbol of the instrument.',
		example: 'AAPL',
		maxLength: 10
	})
	@IsString()
	@Length(1, 10)
	ticker: string;

	@ApiProperty({
		description: 'The name of the instrument.',
		example: 'Apple Inc.',
		maxLength: 255
	})
	@IsString()
	@Length(1, 255)
	name: string;

	@ApiProperty({
		description: 'The type of the instrument.',
		example: AssetType.STOCKS,
		enum: AssetType
	})
	@IsString()
	@Length(1, 10)
	@IsEnum(AssetType, { message: `type must be one of the following values: ${Object.values(AssetType).join(', ')}` })
	type: AssetType;
}
