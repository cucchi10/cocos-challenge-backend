import { Module } from '@nestjs/common';
import { InstrumentsModule } from '../../instruments/instruments.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
	imports: [InstrumentsModule],
	controllers: [AssetsController],
	providers: [AssetsService]
})
export class AssetsModule {}
