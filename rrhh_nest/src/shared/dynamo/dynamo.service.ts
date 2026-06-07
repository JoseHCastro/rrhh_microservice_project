import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceNotFoundException,
  UpdateTimeToLiveCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoService implements OnModuleInit {
  private readonly logger = new Logger(DynamoService.name);
  readonly client: DynamoDBClient;
  readonly docClient: DynamoDBDocumentClient;
  readonly tableName: string;
  readonly gsi1Name: string;

  constructor(private readonly config: ConfigService) {
    this.tableName = this.config.getOrThrow<string>('DYNAMODB_TABLE_BITACORA');
    this.gsi1Name = this.config.getOrThrow<string>('DYNAMODB_GSI1_NAME');
    // Endpoint vacío => SDK usa el endpoint real de AWS (no el contenedor local).
    const endpoint = this.config.get<string>('DYNAMODB_ENDPOINT');
    this.client = new DynamoDBClient({
      region: this.config.getOrThrow<string>('DYNAMODB_REGION'),
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('DYNAMODB_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('DYNAMODB_SECRET_ACCESS_KEY'),
      },
    });
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  onModuleInit(): void {
    // NO bloquear el arranque del servidor esperando a DynamoDB: si está caído
    // o lento, la API debe levantar igual. Creamos la tabla en segundo plano.
    // Las escrituras de bitácora ya manejan fallos de forma tolerante.
    void this.ensureTable().catch((err) =>
      this.logger.error(`No se pudo asegurar la tabla DynamoDB '${this.tableName}': ${err}`),
    );
  }

  /**
   * Crea la tabla `BitacoraAuditoria` si no existe, respetando el schema
   * oficial definido en Documentacion Contexto:
   *   PK = USER#<usuario_id>   SK = <ISO_ts>#<uuid>
   *   GSI1PK = DOC#<doc_s3_id>  GSI1SK = <ISO_ts>
   *   TTL: 365 días (atributo "ttl")
   */
  private async ensureTable(): Promise<void> {
    try {
      await this.client.send(new DescribeTableCommand({ TableName: this.tableName }));
      this.logger.log(`Tabla DynamoDB '${this.tableName}' ya existe`);
      return;
    } catch (err) {
      if (!(err instanceof ResourceNotFoundException)) throw err;
    }

    this.logger.log(`Creando tabla DynamoDB '${this.tableName}'...`);
    await this.client.send(
      new CreateTableCommand({
        TableName: this.tableName,
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
          { AttributeName: 'GSI1PK', AttributeType: 'S' },
          { AttributeName: 'GSI1SK', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: this.gsi1Name,
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      }),
    );

    // DynamoDB Local no siempre soporta UpdateTimeToLive, lo intentamos best-effort
    try {
      await this.client.send(
        new UpdateTimeToLiveCommand({
          TableName: this.tableName,
          TimeToLiveSpecification: { Enabled: true, AttributeName: 'ttl' },
        }),
      );
    } catch (err) {
      this.logger.warn(`No se pudo activar TTL (probablemente DynamoDB Local): ${err}`);
    }
    this.logger.log(`Tabla DynamoDB '${this.tableName}' creada`);
  }
}
