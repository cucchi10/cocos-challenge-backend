import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
	@ApiPropertyOptional({
		description: 'The page number to retrieve.',
		example: 1,
		minimum: 1
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt({ message: 'page must be an integer' })
	@Min(1, { message: 'page must be at least 1' })
	page: number = 1;

	@ApiPropertyOptional({
		description: 'The number of items per page.',
		example: 10,
		minimum: 1,
		maximum: 100
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt({ message: 'limit must be an integer' })
	@Min(1, { message: 'limit must be at least 1' })
	@Max(100, { message: 'limit must be at most 100' })
	limit: number = 10;
}
