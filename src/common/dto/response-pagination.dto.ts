import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

@ApiExtraModels()
export class PaginatedResponseDto {
	@ApiProperty({
		description: 'Total number of available assets in the database'
	})
	total: number;

	@ApiProperty({
		description: 'Current page number'
	})
	page: number;

	@ApiProperty({
		description: 'Number of items per page'
	})
	limit: number;

	@ApiProperty({
		description: 'Total number of available pages'
	})
	totalPages: number;
}

@ApiExtraModels(PaginatedResponseDto)
export class PaginatedResponse<T> extends PaginatedResponseDto {
	@ApiProperty({
		type: Array<T>
	})
	data: T[];
}
