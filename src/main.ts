import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { configSwagger } from 'src/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Config swagger
  configSwagger(app);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
