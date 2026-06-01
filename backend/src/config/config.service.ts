import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DocumentBuilder } from '@nestjs/swagger';
import { JwtSignOptions } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Resolve which environment-specific file to use as defaults. Priority:
// 1. process.env.MODE
// 2. process.env.NODE_ENV
// Fallback to 'development'
const envName = (process.env.MODE || process.env.NODE_ENV || 'development')
  .toString()
  .toLowerCase();

// Load env files in priority order. dotenv never overrides a variable that is
// already set, so the FIRST file loaded wins. The generic `.env` (gitignored,
// your local machine config) therefore takes precedence; `.env.<env>` only
// supplies defaults for keys `.env` didn't define.
for (const file of ['.env', `.env.${envName}`]) {
  const full = path.resolve(process.cwd(), file);
  if (fs.existsSync(full)) {
    dotenv.config({ path: full });
  }
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

  public getStripeConfig() {
    // When STRIPE_SECRET_KEY is unset the app runs in "mock" payment mode:
    // checkout sessions resolve to a local simulated-payment page so the full
    // cart -> pay -> confirm flow is testable without real Stripe credentials.
    const secretKey = this.getValue('STRIPE_SECRET_KEY', false) || '';
    const webhookSecret = this.getValue('STRIPE_WEBHOOK_SECRET', false) || '';
    const currency = (
      this.getValue('STRIPE_CURRENCY', false) || 'usd'
    ).toLowerCase();
    const frontendUrl = (
      this.getValue('FRONTEND_URL', false) || 'http://localhost:3000'
    ).replace(/\/+$/, '');

    return {
      secretKey,
      webhookSecret,
      currency,
      frontendUrl,
      // Mock mode is active whenever no secret key is configured.
      mock: secretKey.length === 0,
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
