import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SecondaryActions } from '../../../common/enums/transactions.enums';

export class SecondaryTransactionDto {
	@ApiProperty({
		description: 'The account number associated with the transaction to cancel.',
		example: '123456'
	})
	@IsString({ message: 'Account number must be a string.' })
	@IsNotEmpty({ message: 'Account number is required and cannot be empty.' })
	accountNumber: string;

	@ApiPropertyOptional({
		description: 'The reason for canceling the transaction.',
		example: 'User requested cancellation.'
	})
	@IsOptional()
	@IsString({ message: 'Reason must be a string if provided.' })
	reason?: string;

	@ApiProperty({
		description: 'The type of secondary operation to perform.',
		enum: SecondaryActions,
		example: SecondaryActions.Cancel
	})
	@IsEnum(SecondaryActions, { message: `Operation type must be one of the following: ${Object.values(SecondaryActions).join(', ')}` })
	@IsNotEmpty({ message: 'Secondary operation type is required.' })
	secondaryAction: SecondaryActions;
}
