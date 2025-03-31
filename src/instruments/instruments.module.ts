import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from './entities/instrument.entity';
import { InstrumentsService } from './instruments.service';

@Module({
	imports: [TypeOrmModule.forFeature([Instrument])],
	controllers: [],
	providers: [InstrumentsService],
	exports: [InstrumentsService]
})
export class InstrumentsModule {}
