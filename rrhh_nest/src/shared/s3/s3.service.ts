import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly expiresSeconds: number;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.getOrThrow<string>('AWS_S3_ENDPOINT');
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
    this.expiresSeconds = this.config.getOrThrow<number>('S3_PRESIGNED_URL_EXPIRES_SECONDS');

    this.client = new S3Client({
      region: this.config.getOrThrow<string>('AWS_S3_REGION'),
      endpoint: endpoint || undefined,
      forcePathStyle: this.config.get<string>('AWS_S3_FORCE_PATH_STYLE') === 'true',
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async getPresignedUploadUrl(s3Key: string, contentType: string): Promise<string> {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, cmd, { expiresIn: this.expiresSeconds });
  }

  async getPresignedDownloadUrl(s3Key: string, expiresIn?: number): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresIn ?? this.expiresSeconds });
  }

  async objectExists(s3Key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: s3Key }));
      return true;
    } catch {
      return false;
    }
  }

  async deleteObject(s3Key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: s3Key }));
  }

  async putObject(s3Key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: body,
        ContentType: contentType,
      }),
    );
    this.logger.log(`S3 PUT ${s3Key} (${body.length} bytes)`);
  }
}
