import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const frontendOrigin = process.env['FRONTEND_ORIGIN'];
  if (!frontendOrigin) throw new Error('Bad frontend origin');
  const corsOrigin = [frontendOrigin];

  const corsOptions: CorsOptions | CorsOptionsDelegate<any> = {
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Content-Type',
      'Authorization',
    ],
    exposedHeaders: 'Authorization',
    methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE', 'PATCH'],
  };

  const adapter = new FastifyAdapter();
  adapter.enableCors(corsOptions);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  await app.listen(8080, '0.0.0.0');
}
bootstrap();
