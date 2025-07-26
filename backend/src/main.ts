import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Get environment variables
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  
  // Set global prefix
  app.setGlobalPrefix(apiPrefix);
  
  // Enable CORS with specific configuration
  app.enableCors({
    origin: [
      'http://localhost:19006', // Expo web development server
      'http://localhost:3000',  // Alternative frontend port
      'http://localhost:8081',  // Expo Metro bundler
      'http://127.0.0.1:19006', // Alternative localhost format
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8081',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });
  
  // Set up global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('City Work API')
    .setDescription('The City Work API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  // Start the server
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();