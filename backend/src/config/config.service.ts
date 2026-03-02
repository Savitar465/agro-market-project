import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {DocumentBuilder} from "@nestjs/swagger";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment-specific .env file. Priority:
// 1. process.env.MODE
// 2. process.env.NODE_ENV
// Fallback to 'development'
const envName = (process.env.MODE || process.env.NODE_ENV || 'development').toString().toLowerCase();
const envFile = path.resolve(process.cwd(), `.env.${envName}`);
// Try to load the specific env file, then fallback to .env
dotenv.config({ path: envFile });
if (!process.env.POSTGRES_HOST) {
  // fallback to generic .env if specific file missing or didn't set vars
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

class ConfigService {

  constructor(private readonly env: { [k: string]: string | undefined }) {
  }

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

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    const isTsNode = (process.env.TS_NODE || '').toLowerCase() === 'true';
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

  public openApiConfig = new DocumentBuilder()
    .setTitle('Market API')
    .setDescription('The market API documentation')
    .setVersion('1.0')
    .build();

}

const configService = new ConfigService(process.env)
  .ensureValues([
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE'
  ]);

export {configService};