import 'dotenv/config';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

const DEFAULT_PORT = 3000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Retrox API')
    .setDescription('90년대 오락실 게임 - 코인, 유저, 점수 관리 API')
    .setVersion('1.0')
    .addTag('health', '서버 상태 확인')
    .addTag('users', '사용자 관리')
    .addTag('coins', '코인 관리 (지급/소비/잔액)')
    .addTag('scores', '게임 점수 및 랭킹')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT;
  await app.listen(port);
}

void bootstrap();
