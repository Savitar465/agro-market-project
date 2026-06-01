import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DocumentBuilder } from '@nestjs/swagger';
import { JwtSignOptions } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment-specific .env file. Priority:
// 1. process.env.MODE
// 2. process.env.NODE_ENV
// Fallback to 'development'
const envName = (process.env.MODE || process.env.NODE_ENV || 'development')
  .toString()
  .toLowerCase();
const envFile = path.resolve(process.cwd(), `.env.${envName}`);
// Try to load the specific env file, then fallback to .env
dotenv.config({ path: envFile });
if (!process.env.POSTGRES_HOST) {
  // fallback to generic .env if specific file missing or didn't set vars
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

class ConfigService {
  constructor(private readonly env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return <string>value;
  }

  public ensureValues(keys: string[]) {
    for (const k of keys) {
      this.getValue(k, true);
    }
    return this;
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getJwtSecret(): string {
    // Falls back to a dev-only secret when JWT_SECRET is unset. Production
    // must set JWT_SECRET (see ensureValues guard below).
    return this.getValue('JWT_SECRET', false) || 'ZYlXH907GhWEe8';
  }

  public getJwtExpiresIn(): JwtSignOptions['expiresIn'] {
    return (this.getValue('JWT_EXPIRES_IN', false) ||
      '900s') as JwtSignOptions['expiresIn'];
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    // Detect whether we're running through ts-node (e.g. the TypeORM CLI via
    // typeorm-ts-node-commonjs) so migrations resolve to the .ts sources.
    // When compiled and run from dist, __filename ends in .js.
    const isTsNode =
      __filename.endsWith('.ts') ||
      (process.env.TS_NODE || '').toLowerCase() === 'true';
    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: Number.parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),

      entities: [__dirname + '/../**/*.entity{.ts,.js}'],

      migrationsTableName: 'migration',
      synchronize: false,
      migrations: [isTsNode ? 'src/migrations/*.ts' : 'dist/migrations/*.js'],

      ssl: this.isProduction(),
    };
  }

  public getMinioConfig() {
    const endPoint =
      this.getValue('MINIO_ENDPOINT', false) || '192.168.100.150';
    const port = Number.parseInt(
      this.getValue('MINIO_PORT', false) || '9000',
      10,
    );
    const useSSL =
      (this.getValue('MINIO_USE_SSL', false) || 'false').toLowerCase() ===
      'true';
    const bucket = this.getValue('MINIO_BUCKET', false) || 'product-images';
    const publicUrl =
      this.getValue('MINIO_PUBLIC_URL', false) ||
      `${useSSL ? 'https' : 'http'}://${endPoint}:${port}`;

    return {
      endPoint,
      port,
      useSSL,
      accessKey: this.getValue('MINIO_ACCESS_KEY', false) || 'minioadmin',
      secretKey: this.getValue('MINIO_SECRET_KEY', false) || 'minioadmin',
      bucket,
      // Base URL used to build publicly reachable object links.
      publicUrl: publicUrl.replace(/\/+$/, ''),
    };
  }

  public openApiConfig = new DocumentBuilder()
    .setTitle('Market API')
    .setDescription('The market API documentation')
    .setVersion('1.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

// Never run production on the hardcoded dev JWT secret.
if (configService.isProduction()) {
  configService.ensureValues(['JWT_SECRET']);
}

export { configService };
