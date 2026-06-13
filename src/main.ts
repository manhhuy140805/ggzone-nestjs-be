import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');

  await app.listen(port);
}
void bootstrap();
