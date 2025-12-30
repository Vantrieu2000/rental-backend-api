import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { ValidationPipe } from './common/pipes';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(AppConfigService);
  const port = configService.port;

  // Apply security headers with helmet
  app.use(helmet());

  // Apply global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Apply global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Apply global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS
  app.enableCors({
    origin: configService.allowedOrigins,
    credentials: true,
  });

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Rental Management API')
    .setDescription(
      'API for managing rental properties, rooms, tenants, payments, reminders, and notifications',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
  console.log(`Environment: ${configService.nodeEnv}`);
}
bootstrap();
