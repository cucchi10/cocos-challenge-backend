import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiConfig } from './config/interfaces/api.interface';

async function bootstrap() {
	const logger = new Logger('Main bootstrap');
	const app = await NestFactory.create(AppModule);

	const configService = app.get<ConfigService>(ConfigService);

	const { port, apiPrefixVersion, version } = configService.get<ApiConfig>('api')!;

	// API PREFIX
	app.setGlobalPrefix(apiPrefixVersion);

	// SWAGGER
	const docConfig = new DocumentBuilder()
		.setTitle('Cocos Capital API')
		.setDescription('The Cocos Capital API description')
		.setVersion(version)
		.addBearerAuth()
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, docConfig);

	SwaggerModule.setup(`${apiPrefixVersion}/doc`, app, documentFactory);

	// VALIDATION PIPES
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port);
	logger.debug(`App running on port ${port}`);
}
bootstrap();
