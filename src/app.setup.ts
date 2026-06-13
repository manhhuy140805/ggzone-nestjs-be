import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupApp(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.getOrThrow<string>('app.apiPrefix');
  const corsOrigins = configService.get<string[] | true>('app.corsOrigins');

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    credentials: true,
    origin: corsOrigins ?? true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GGZone API')
    .setDescription('NestJS + PostgreSQL API documentation for GGZone')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'GGZone API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
    useGlobalPrefix: true,
  });
}
