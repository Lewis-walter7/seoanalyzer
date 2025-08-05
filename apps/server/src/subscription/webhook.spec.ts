import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { IntaSendProvider } from './subscription.types';

describe('WebhookController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/v1/subscription/intasend/webhook (POST) should handle card provider', () => {
    return request(app.getHttpServer())
      .post('/v1/subscription/intasend/webhook')
      .send({
        invoice_id: 'some_invoice_id',
        provider: IntaSendProvider.CARD,
        state: 'COMPLETED',
      })
      .expect(200)
      .expect({ status: 'received' });
  });
});

