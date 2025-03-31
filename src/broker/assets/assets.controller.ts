import { Controller, Get, Query } from '@nestjs/common';
import { SearchAssetsDto } from './dto/search-assets.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { InstrumentDto } from '../../instruments/dto/intrument.dto';
import { ApiResponsePaginated } from '../../common/decorator/response-pagination.decorator';

@ApiTags('Assets')
@Controller('broker/assets')
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@ApiOperation({
		summary: 'Search assets in the market',
		description: 'This endpoint allows you to search for assets by ticker or name. You can provide one or both parameters.'
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request, invalid query parameters.'
	})
	@ApiResponsePaginated({
		description: 'List of assets matching the search criteria with pagination details',
		type: InstrumentDto
	})
	@ApiQuery({ name: 'ticker', required: false, type: String, description: 'The ticker symbol of the asset' })
	@ApiQuery({ name: 'name', required: false, type: String, description: 'The name of the asset' })
	@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
	@ApiQuery({ name: 'per_page', required: false, type: Number, description: 'Results per page' })
	@Get('search')
	async findAssets(@Query() query: SearchAssetsDto) {
		return this.assetsService.findAssets(query);
	}
}
