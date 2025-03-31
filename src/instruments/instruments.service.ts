import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchAssetsDto } from '../broker/assets/dto/search-assets.dto';
import { Repository } from 'typeorm';
import { Instrument } from './entities/instrument.entity';
import { getSkip, getTotalPages } from '../common/utils/pagination.helpers';
import { InstrumentDto } from './dto/intrument.dto';
import { PaginatedResponse } from '../common/dto/response-pagination.dto';
import { AssetType } from '../common/enums/instruments.enums';

@Injectable()
export class InstrumentsService {
	constructor(
		@InjectRepository(Instrument)
		private readonly instrumentRepository: Repository<Instrument>
	) {}

	/**
	 * Finds assets based on the provided search criteria and returns a paginated list.
	 *
	 * This method allows you to search for assets by their ticker or name. The search is case-insensitive,
	 * and you can provide one or both parameters. The method also supports pagination.
	 *
	 * @param {SearchAssetsDto} query - The query parameters containing the search criteria and pagination info.
	 * @returns {Promise<PaginatedResponse<InstrumentDto>>} - A promise that resolves to an object containing
	 * the list of matching assets, total count, current page, limit, and total pages.
	 */
	async findAssets(query: SearchAssetsDto): Promise<PaginatedResponse<InstrumentDto>> {
		const { ticker, name, page, limit } = query;

		const queryBuilder = this.instrumentRepository.createQueryBuilder(Instrument.name);

		if (ticker) {
			queryBuilder.orWhere(`${Instrument.name}.ticker ILIKE :ticker`, { ticker: `%${ticker}%` });
		}

		if (name) {
			queryBuilder.orWhere(`${Instrument.name}.name ILIKE :name`, { name: `%${name}%` });
		}

		const skip = getSkip(page, limit);

		queryBuilder.skip(skip).take(limit);

		const [result, total] = await queryBuilder.getManyAndCount();

		return {
			data: result,
			total,
			page,
			limit,
			totalPages: getTotalPages(total, limit)
		};
	}

	/**
	 * Retrieves a list of instruments by their IDs.
	 * This method joins the `marketData` table to include related market data for each instrument.
	 *
	 * @param {number[]} instrumentIds - An array of instrument IDs. The method retrieves all instruments whose `id` is in this list.
	 *
	 * @returns {Promise<Instrument[]>} - A promise that resolves to an array of `Instrument` entities, each including its related `marketData` information.
	 */
	async getInstrumentsByIds(instrumentIds: number[]) {
		return this.instrumentRepository
			.createQueryBuilder(Instrument.name)
			.where(`${Instrument.name}.id IN (:...instrumentIds)`, { instrumentIds })
			.getMany();
	}

	/**
	 * Retrieves the ID of an instrument based on its ticker symbol.
	 *
	 * @param {string} ticker - The ticker symbol of the instrument to find.
	 * @returns {Promise<number>} The ID of the found instrument.
	 * @throws {NotFoundException} If no instrument is found with the provided ticker.
	 */
	async getInstrumentIdByTicker(ticker: string) {
		const instrument = await this.instrumentRepository.findOne({ where: { ticker }, select: ['id'] });
		if (!instrument) {
			throw new NotFoundException(`No assets found with the provided ticker: ${ticker}`);
		}

		return instrument.id;
	}

	/**
	 * Retrieves the ID of the asset (currency) based on the provided ticker.
	 *
	 * Searches for an asset of type `CURRENCY` with the given ticker symbol. If found, returns the asset's ID.
	 * If no matching asset is found, throws a NotFoundException.
	 *
	 * @param {string} ticker - The ticker symbol of the asset (currency) to search for.
	 * @returns {Promise<number>} - The ID of the asset (currency) if found.
	 * @throws {NotFoundException} - If no asset with the provided ticker and type `CURRENCY` is found.
	 */
	async getMoneyId(ticker: string) {
		const instrument = await this.instrumentRepository.findOne({ where: { ticker, type: AssetType.CURRENCY }, select: ['id'] });
		if (!instrument) {
			throw new NotFoundException(`No assets found with the provided ticker: ${ticker} and type: ${AssetType.CURRENCY}`);
		}

		return instrument.id;
	}
}
