import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SearchAssetsDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'The ticker symbol of the asset', maxLength: 10 })
	@IsOptional()
	@IsString({ message: 'ticker must be a string.' })
	@Length(1, 10, { message: 'ticker must be between 1 and 10 characters long.' })
	ticker?: string;

	@ApiPropertyOptional({ description: 'The name of the asset', maxLength: 255 })
	@IsOptional()
	@IsString({ message: 'name must be a string.' })
	@Length(1, 255, { message: 'name must be between 1 and 255 characters long.' })
	name?: string;
}
