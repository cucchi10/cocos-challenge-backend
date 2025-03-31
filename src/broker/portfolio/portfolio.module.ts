import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { UseCaseModule } from '../useCase/useCase.module';

@Module({
	imports: [UsersModule, UseCaseModule],
	controllers: [PortfolioController],
	providers: [PortfolioService]
})
export class PortfolioModule {}
