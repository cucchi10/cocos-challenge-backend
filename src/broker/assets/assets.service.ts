import { Injectable } from '@nestjs/common';
import { InstrumentsService } from '../../instruments/instruments.service';
import { SearchAssetsDto } from './dto/search-assets.dto';

@Injectable()
export class AssetsService {
	constructor(private readonly instrumentsService: InstrumentsService) {}
	async findAssets(query: SearchAssetsDto) {
		return this.instrumentsService.findAssets(query);
	}
}
