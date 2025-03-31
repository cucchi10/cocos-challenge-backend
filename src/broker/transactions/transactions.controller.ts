import { Controller, Post, Body, Param, Delete, Get, Query, HttpCode } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { SecondaryTransactionDto } from './dto/secondary-transaction.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderResponseDto } from './dto/response-get-transactions.dto';
import { PositiveNumberPipe } from '../../common/pipes/positive-number.pipe';
import { SearchAssetsDto } from '../assets/dto/search-assets.dto';
import { ApiResponsePaginated } from '../../common/decorator/response-pagination.decorator';

@ApiTags('Transactions')
@Controller('broker/transactions')
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@ApiOperation({
		summary: 'Get all transactions by account number',
		description:
			'This endpoint retrieves all transactions associated with the provided account number. It returns transaction details such as the type, amount, and status.'
	})
	@ApiResponsePaginated({
		description: 'List of transactions for the specified account number with pagination details',
		type: OrderResponseDto
	})
	@ApiResponse({
		status: 404,
		description: 'Account number not found or invalid.'
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request, the request could not be processed due to invalid data or business rule violation.'
	})
	@ApiParam({
		name: 'accountNumber',
		description: 'The account number associated with the transactions to retrieve.',
		example: '123456',
		type: String
	})
	@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
	@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Results per page' })
	@Get('account/:accountNumber')
	getTransactionsByAccountNumber(@Param('accountNumber') accountNumber: string, @Query() query: SearchAssetsDto) {
		return this.transactionsService.getTransactionsByAccountNumber(accountNumber, query);
	}

	@ApiOperation({
		summary: 'Create a new transaction',
		description: 'This endpoint creates a new transaction for the specified user and instrument. It supports both buy and sell transactions.'
	})
	@ApiResponse({
		status: 201,
		description: 'Transaction created successfully.'
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input or validation error.'
	})
	@ApiResponse({
		status: 500,
		description: 'Internal server error. Something went wrong while processing the request.'
	})
	@HttpCode(201)
	@Post()
	createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
		return this.transactionsService.createTransaction(createTransactionDto);
	}

	@ApiOperation({
		summary: 'Cancel a transaction by ID',
		description: 'This endpoint cancels a transaction identified by its ID. The transaction will be marked as cancelled in the system.'
	})
	@ApiResponse({
		status: 201,
		description: 'Transaction cancelled successfully.'
	})
	@ApiResponse({
		status: 404,
		description: 'Transaction not found with the provided ID.'
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid request or validation error.'
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the transaction to cancel.',
		example: '1',
		type: String
	})
	@HttpCode(201)
	@Delete('cancel/:id')
	cancelTransaction(@Param('id', PositiveNumberPipe) id: number, @Body() cancelTransactionDto: SecondaryTransactionDto) {
		return this.transactionsService.cancelTransaction(id, cancelTransactionDto);
	}
}
