import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvSchema {
  @IsString()
  NODE_ENV!: string;

  @IsInt()
  @Min(1)
  PORT!: number;

  // Postgres
  @IsString()
  DATABASE_URL!: string;

  // JWT
  @IsString()
  JWT_SECRET!: string;

  @IsInt()
  JWT_EXPIRATION_MS!: number;

  // S3 / MinIO
  @IsString()
  AWS_S3_ENDPOINT!: string;

  @IsString()
  AWS_S3_REGION!: string;

  @IsString()
  AWS_S3_BUCKET!: string;

  @IsString()
  AWS_S3_ACCESS_KEY_ID!: string;

  @IsString()
  AWS_S3_SECRET_ACCESS_KEY!: string;

  @IsBooleanString()
  AWS_S3_FORCE_PATH_STYLE!: string;

  @IsInt()
  S3_PRESIGNED_URL_EXPIRES_SECONDS!: number;

  // DynamoDB
  @IsString()
  DYNAMODB_ENDPOINT!: string;

  @IsString()
  DYNAMODB_REGION!: string;

  @IsString()
  DYNAMODB_ACCESS_KEY_ID!: string;

  @IsString()
  DYNAMODB_SECRET_ACCESS_KEY!: string;

  @IsString()
  DYNAMODB_TABLE_BITACORA!: string;

  @IsString()
  DYNAMODB_GSI1_NAME!: string;

  @IsInt()
  BITACORA_TTL_DAYS!: number;

  // n8n
  @IsString()
  N8N_WEBHOOK_SECRET!: string;

  @IsString()
  @IsOptional()
  N8N_BASE_URL?: string;

  // CORS
  @IsString()
  CORS_ALLOWED_ORIGINS!: string;

  // ── IA (opcional / opt-in) ──
  @IsString()
  @IsOptional()
  IA_ANALISIS_HABILITADO?: string;

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;

  @IsString()
  @IsOptional()
  GEMINI_MODEL?: string;

  // ── Aprobación por correo ──
  @IsString()
  @IsOptional()
  PUBLIC_BASE_URL?: string;

  @IsString()
  @IsOptional()
  APROBACION_TOKEN_TTL_HORAS?: string;

  // ── Telegram (aviso de resultado al empleado) ──
  @IsString()
  @IsOptional()
  TELEGRAM_BOT_TOKEN?: string;
}

export function validateEnv(raw: Record<string, unknown>): EnvSchema {
  const validated = plainToInstance(EnvSchema, raw, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Configuración inválida (.env):\n${errors
        .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
        .join('\n')}`,
    );
  }
  return validated;
}
