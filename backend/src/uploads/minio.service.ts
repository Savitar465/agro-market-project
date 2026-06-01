import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from 'minio';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { configService } from '../config/config.service';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly config = configService.getMinioConfig();
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      endPoint: this.config.endPoint,
      port: this.config.port,
      useSSL: this.config.useSSL,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey,
    });
  }

  /** Ensure the bucket exists and is publicly readable for serving images. */
  async onModuleInit(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.config.bucket);
      if (!exists) {
        await this.client.makeBucket(this.config.bucket, '');
        this.logger.log(`Created MinIO bucket "${this.config.bucket}"`);
      }
      await this.client.setBucketPolicy(
        this.config.bucket,
        this.publicReadPolicy(),
      );
    } catch (err) {
      // Don't crash the app if MinIO is unreachable at boot — uploads will
      // surface a clear error when actually attempted.
      this.logger.warn(`MinIO bucket init skipped: ${(err as Error).message}`);
    }
  }

  /**
   * Upload a file buffer and return its publicly reachable URL plus the
   * object name (kept so the object can be deleted later).
   */
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; objectName: string }> {
    if (!file?.buffer) {
      throw new InternalServerErrorException('No file buffer received');
    }

    const ext = extname(file.originalname) || '';
    const objectName = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`;

    try {
      await this.client.putObject(
        this.config.bucket,
        objectName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );
    } catch (err) {
      this.logger.error(`MinIO upload failed: ${(err as Error).message}`);
      throw new InternalServerErrorException('Failed to upload image');
    }

    return {
      url: `${this.config.publicUrl}/${this.config.bucket}/${objectName}`,
      objectName,
    };
  }

  /** Delete an object by its name (best-effort). */
  async deleteImage(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.config.bucket, objectName);
    } catch (err) {
      this.logger.warn(
        `MinIO delete failed for "${objectName}": ${(err as Error).message}`,
      );
    }
  }

  private publicReadPolicy(): string {
    return JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.config.bucket}/*`],
        },
      ],
    });
  }
}
