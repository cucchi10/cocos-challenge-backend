import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponse, PaginatedResponseDto } from '../dto/response-pagination.dto';

export interface ApiResponsePaginatedOptions {
	description: string;
	type: any;
}

export const ApiResponsePaginated = ({ type, description }: ApiResponsePaginatedOptions) => {
	return applyDecorators(
		ApiExtraModels(PaginatedResponse, type),
		ApiOkResponse({
			description,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(PaginatedResponseDto) },
					{
						properties: {
							data: {
								type: 'array',
								items: {
									$ref: getSchemaPath(type)
								}
							}
						}
					}
				]
			}
		})
	);
};
