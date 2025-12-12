import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { configSwagger } from 'src/config/swagger.config';
import { TransformInterceptor } from 'src/common/interceptor/transform.interceptor';
import { HttpExceptionFilter } from 'src/common/filters/http-exeption.filter';

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

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Config swagger
  configSwagger(app);
  // Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());
  // Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
