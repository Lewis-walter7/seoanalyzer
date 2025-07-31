import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});

describe('API Route Tests', () => {
  const projectId = '1'; // Make sure this matches your testing data

  it('should authenticate successfully and return audits', async () => {
    const token = '<VALID_USER_JWT>'; // Replace with method to retrieve valid token
    const response = await request(app.getHttpServer())
      .get(`/v1/projects/${projectId}/audits`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(200);
    expect(response.body.audits).toBeDefined();
  });

  it('should fail authentication without token', async () => {
    const response = await request(app.getHttpServer())
      .get(`/v1/projects/${projectId}/audits`);

    expect(response.status).toEqual(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('should return 404 for non-existing project', async () => {
    const token = '<VALID_USER_JWT>';  // Change according to project needs
    const response = await request(app.getHttpServer())
      .get('/v1/projects/non_existing_id/audits')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(404);
    expect(response.body.error).toBe('Project not found');
  });
});

