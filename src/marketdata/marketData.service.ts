import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketData } from './entities/marketData.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MarketDataService {
	constructor(
		@InjectRepository(MarketData)
		private readonly marketDataRepository: Repository<MarketData>
	) {}

	/**
	 * Retrieves a list of market data entries by instrument IDs, including related instrument information.
	 * This method joins the `instruments` table to include the related instrument details for each market data entry.
	 *
	 * @param {number[]} instrumentIds - An array of instrument IDs. The method retrieves all market data entries whose associated instrument's `id` is in this list.
	 *
	 * @returns {Promise<MarketData[]>} - A promise that resolves to an array of `MarketData` entities, each including its related `instruments` information.
	 */
	async getMarketDataByInstrumentIds(instrumentIds: number[]) {
		return this.marketDataRepository
			.createQueryBuilder(MarketData.name)
			.leftJoinAndSelect(`${MarketData.name}.instrument`, 'instrument')
			.where(`${MarketData.name}.instrumentId IN (:...instrumentIds)`, { instrumentIds })
			.orderBy(`${MarketData.name}.instrumentId`, 'ASC')
			.addOrderBy(`${MarketData.name}.date`, 'DESC')
			.distinctOn([`${MarketData.name}.instrumentId`])
			.getMany();
	}

	/**
	 * Retrieves the most recent market data (`MarketData`) record for a specific instrument, ordered by date.
	 *
	 * This method queries the database using the provided `instrumentId` and retrieves the most recent `MarketData`
	 * record associated with that instrument. The results are ordered by the `date` in descending order, so the latest
	 * record is returned. If no record is found for the provided `instrumentId`, a `NotFoundException` is thrown.
	 *
	 * @param {number} instrumentId - The unique identifier of the instrument for which the market data is being fetched.
	 *
	 * @returns {Promise<MarketData>} - A promise that resolves to the most recent `MarketData` record if found.
	 * @throws {NotFoundException} - If no market data is found for the provided `instrumentId`.
	 */
	async getMarketDataByInstrumentId(instrumentId: number) {
		const marketData = await this.marketDataRepository.findOne({
			where: { instrument: { id: instrumentId } },
			relations: ['instrument'],
			order: {
				date: 'DESC'
			},
			select: ['id', 'date', 'close', 'previousClose']
		});

		if (!marketData) {
			throw new NotFoundException(`No market data found for the instrument with id ${instrumentId}`);
		}

		return marketData;
	}
}
