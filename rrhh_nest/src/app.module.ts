import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { validateEnv } from './config/env.validation';
import { PrismaModule } from './shared/prisma/prisma.module';
import { S3Module } from './shared/s3/s3.module';
import { DynamoModule } from './shared/dynamo/dynamo.module';
import { IaModule } from './shared/ia/ia.module';
import { TelegramModule } from './shared/telegram/telegram.module';
import { AuthModule } from './auth/auth.module';
import { Public } from './auth/decorators/public.decorator';
import { PrivilegiosModule } from './modules/privilegios/privilegios.module';
import { GruposModule } from './modules/grupos/grupos.module';
import { ArchivosModule } from './modules/archivos/archivos.module';
import { BitacoraModule } from './modules/bitacora/bitacora.module';
import { CanalesModule } from './modules/canales/canales.module';
import { JustificacionesModule } from './modules/justificaciones/justificaciones.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

// Boilerplate original — se mantiene como prueba de que GraphQL responde.
// Será reemplazado por los módulos de dominio en las próximas fases.
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloResolver } from './hello.resolver';
// Marcamos el resolver hello como público para que siga respondiendo sin token
// (es solo demo). Los nuevos módulos sí requerirán JWT.
Public()(HelloResolver);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      sortSchema: true,
      // El request entra al contexto para que Passport popule req.user
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
    }),
    PrismaModule,
    S3Module,
    DynamoModule,
    IaModule,
    TelegramModule,
    AuthModule,
    PrivilegiosModule,
    GruposModule,
    BitacoraModule,
    ArchivosModule,
    CanalesModule,
    JustificacionesModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService, HelloResolver],
})
export class AppModule {}
