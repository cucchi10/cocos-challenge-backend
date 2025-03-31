import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isPositiveNumber } from '../utils/price.helpers';

@Injectable()
export class PositiveNumberPipe implements PipeTransform {
	transform(value: any) {
		if (!isPositiveNumber(+value)) {
			throw new BadRequestException('The ID must be a positive number');
		}

		return +value;
	}
}
