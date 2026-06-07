import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // NOTA: no usamos whitelist/forbidNonWhitelisted porque GraphQL ya valida la
  // forma de los inputs por su sistema de tipos, y esos flags rechazarían los
  // campos ID (bigint) que solo llevan @Field sin decorador class-validator.
  // Tampoco enableImplicitConversion: coercionaría mal los scalars BigInt.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const corsOrigins = config
    .getOrThrow<string>('CORS_ALLOWED_ORIGINS')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins, credentials: true });

  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  Logger.log(`rrhh_nest escuchando en :${port} (GraphQL en /graphql)`, 'Bootstrap');
}
bootstrap();
