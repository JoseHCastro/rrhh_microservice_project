import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DynamoService } from '../../shared/dynamo/dynamo.service';
import { AccionBitacora, ResultadoBitacora } from './bitacora.enums';

interface RegistrarParams {
  usuarioId: bigint;
  archivoId?: bigint | null;
  accion: AccionBitacora;
  resultado?: ResultadoBitacora;
  ipOrigen?: string | null;
  userAgent?: string | null;
  motivoDenegacion?: string | null;
  /** URL/llave S3 del documento (atributo oficial documento_s3_url). */
  documentoS3Url?: string | null;
  /** Plataforma de origen (WEB / MOBILE / TELEGRAM). Oficial: plataforma_origen. */
  plataforma?: string | null;
}

@Injectable()
export class BitacoraService {
  private readonly logger = new Logger(BitacoraService.name);
  private readonly ttlSeconds: number;

  constructor(
    private readonly dynamo: DynamoService,
    config: ConfigService,
  ) {
    this.ttlSeconds = config.getOrThrow<number>('BITACORA_TTL_DAYS') * 24 * 60 * 60;
  }

  /**
   * Escribe un registro en DynamoDB respetando el schema oficial.
   * No lanza si DynamoDB falla — la operación de negocio NO debe romperse
   * por un fallo de auditoría; solo se loguea.
   */
  async registrar(params: RegistrarParams): Promise<void> {
    const nowIso = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + this.ttlSeconds;
    const item: Record<string, unknown> = {
      PK: `USER#${params.usuarioId.toString()}`,
      SK: `${nowIso}#${uuidv4()}`,
      usuario_id: Number(params.usuarioId),
      accion: params.accion,
      resultado: params.resultado ?? ResultadoBitacora.OK,
      timestamp: nowIso,
      ttl,
    };
    if (params.archivoId != null) {
      item.documento_s3_id = Number(params.archivoId);
      item.GSI1PK = `DOC#${params.archivoId.toString()}`;
      item.GSI1SK = nowIso;
    }
    // Atributos oficiales del equipo
    item.plataforma_origen = params.plataforma ?? 'WEB';
    if (params.documentoS3Url) item.documento_s3_url = params.documentoS3Url;
    if (params.ipOrigen) item.ip_origen = params.ipOrigen;
    // Extras propios del Módulo 3 (schemaless: no afectan a los demás módulos)
    if (params.userAgent) item.user_agent = params.userAgent;
    if (params.motivoDenegacion) item.motivo_denegacion = params.motivoDenegacion;

    try {
      await this.dynamo.docClient.send(
        new PutCommand({ TableName: this.dynamo.tableName, Item: item }),
      );
    } catch (err) {
      this.logger.error(`Fallo escribiendo bitácora: ${err}`);
    }
  }

  async queryPorUsuario(
    usuarioId: bigint,
    desde?: string,
    hasta?: string,
    limit = 50,
  ) {
    const pk = `USER#${usuarioId.toString()}`;
    return this.queryWithRange('PK', pk, 'SK', desde, hasta, undefined, limit);
  }

  async queryPorArchivo(
    archivoId: bigint,
    desde?: string,
    hasta?: string,
    limit = 50,
  ) {
    const pk = `DOC#${archivoId.toString()}`;
    return this.queryWithRange(
      'GSI1PK',
      pk,
      'GSI1SK',
      desde,
      hasta,
      this.dynamo.gsi1Name,
      limit,
    );
  }

  private async queryWithRange(
    pkAttr: string,
    pkValue: string,
    skAttr: string,
    desde: string | undefined,
    hasta: string | undefined,
    indexName: string | undefined,
    limit: number,
  ) {
    const expressionAttrNames: Record<string, string> = { '#pk': pkAttr };
    const expressionAttrValues: Record<string, unknown> = { ':pk': pkValue };
    let keyExpr = '#pk = :pk';

    if (desde && hasta) {
      expressionAttrNames['#sk'] = skAttr;
      expressionAttrValues[':d'] = desde;
      expressionAttrValues[':h'] = hasta;
      keyExpr += ' AND #sk BETWEEN :d AND :h';
    } else if (desde) {
      expressionAttrNames['#sk'] = skAttr;
      expressionAttrValues[':d'] = desde;
      keyExpr += ' AND #sk >= :d';
    } else if (hasta) {
      expressionAttrNames['#sk'] = skAttr;
      expressionAttrValues[':h'] = hasta;
      keyExpr += ' AND #sk <= :h';
    }

    const out: QueryCommandOutput = await this.dynamo.docClient.send(
      new QueryCommand({
        TableName: this.dynamo.tableName,
        IndexName: indexName,
        KeyConditionExpression: keyExpr,
        ExpressionAttributeNames: expressionAttrNames,
        ExpressionAttributeValues: expressionAttrValues,
        ScanIndexForward: false,
        Limit: limit,
      }),
    );
    return (out.Items ?? []).map((it) => this.mapItem(it));
  }

  private mapItem(raw: Record<string, unknown>) {
    // timestamp: usa el atributo propio o, si el registro viene de otro módulo
    // que no lo guarda, lo deriva del SK (`<ISO>#<uuid>`) o del GSI1SK.
    const sk = (raw.SK as string) ?? '';
    const timestamp =
      (raw.timestamp as string) ?? (raw.GSI1SK as string) ?? sk.split('#')[0] ?? '';
    return {
      pk: raw.PK as string,
      sk,
      usuarioId: BigInt((raw.usuario_id as number | string) ?? 0),
      documentoS3Id:
        raw.documento_s3_id != null ? BigInt(raw.documento_s3_id as number | string) : null,
      accion: (raw.accion as string) ?? 'DESCONOCIDA',
      resultado: (raw.resultado as string) ?? null,
      ipOrigen: (raw.ip_origen as string) ?? null,
      userAgent: (raw.user_agent as string) ?? null,
      timestamp,
      plataformaOrigen: (raw.plataforma_origen as string) ?? null,
      documentoS3Url: (raw.documento_s3_url as string) ?? null,
      motivoDenegacion: (raw.motivo_denegacion as string) ?? null,
    };
  }
}
