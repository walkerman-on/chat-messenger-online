import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// CORS configuration
	app.enableCors({
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5175'],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});

	// Global prefix
	const globalPrefix = process.env.API_PREFIX || 'api';
	app.setGlobalPrefix(globalPrefix);

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// Swagger configuration
	const config = new DocumentBuilder()
		.setTitle('Telegram Clone API')
		.setDescription('Backend API for Telegram Clone application')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	const port = process.env.PORT || 3000;
	await app.listen(port);

	console.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
	console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();





