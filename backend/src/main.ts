import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {SwaggerModule} from "@nestjs/swagger";
import {configService} from "./config/config.service";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(helmet())
  app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true}));
  const documentFactory = () => SwaggerModule.createDocument(app, configService.openApiConfig);
  SwaggerModule.setup('api', app, documentFactory)

  // CORS configuration
  // Default allowed origins: common localhost ports + production domain
  const defaultAllowed = [
    'http://localhost:3000',
    'http://localhost:4200',
    'http://localhost:5173',
    'http://192.168.1.60:5432',
    'https://agromarket.com',
    'https://www.agromarket.com',
  ];

  // Allow overriding via comma-separated env var: CORS_ALLOWED_ORIGINS
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || defaultAllowed.join(','))
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // support simple wildcard matching like '*.agromarket.com' if provided
      const matched = allowedOrigins.some(pattern => {
        if (!pattern.includes('*')) return false;
        // convert wildcard pattern to regex
        const regex = new RegExp('^' + pattern.split('*').map(escapeRegex).join('.*') + '$');
        return regex.test(origin);
      });
      if (matched) return callback(null, true);
      callback(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(process.env.PORT ?? 3000);
}

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
}

bootstrap();
