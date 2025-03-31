import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { BalanceReportDto } from './dto/response-get-portfoilo.dto';

@ApiTags('Portfolio')
@Controller('broker/portfolio')
export class PortfolioController {
	constructor(private readonly portfolioService: PortfolioService) {}

	@ApiOperation({
		summary: 'Get the portfolio of a user by their account number',
		description:
			'This endpoint retrieves the portfolio of a user, including total value, available funds, and asset details (quantity, total value, performance).'
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the portfolio details of the user.',
		type: BalanceReportDto
	})
	@ApiResponse({
		status: 404,
		description: 'User not found or account number is invalid.'
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request, the request could not be processed due to invalid data or business rule violation.'
	})
	@ApiParam({
		name: 'accountNumber',
		description: 'The account number of the user whose portfolio is to be retrieved.',
		type: String
	})
	@Get(':accountNumber')
	async getPortfolio(@Param('accountNumber') accountNumber: string) {
		return this.portfolioService.getPortfolio(accountNumber);
	}
}
