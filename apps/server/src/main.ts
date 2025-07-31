import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS for development - allow Next.js origin
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  // Use proper structured logging for application startup
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 SEO Analyzer API running on http://localhost:${port}`);
  } else {
    console.info(`SEO Analyzer API started on port ${port}`);
  }
}

bootstrap();
