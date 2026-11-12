import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from './app.js';
import { HealthResponseSchema } from '@saotech/shared';
import type { FastifyInstance } from 'fastify';

interface AppError extends Error {
  statusCode: number;
  code: string;
}

describe('API App & Error Handler', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 4001,
      HOST: '127.0.0.1',
      WEB_ORIGIN: 'http://localhost:3000',
      DATABASE_URL: 'mysql://test:test@localhost:3306/test_db',
      API_SECRET: 'test_secret_must_be_at_least_16_chars',
    });

    // Add a route that throws an intentional error for testing the error handler
    app.get('/test-error', async () => {
      const err = new Error('Intentional test error') as AppError;
      err.statusCode = 400;
      err.code = 'TEST_BAD_REQUEST';
      throw err;
    });

    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('GET /health returns 200 with schema-compliant payload', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload) as unknown;
    const parsed = HealthResponseSchema.parse(body);
    assert.equal(parsed.status, 'ok');
    assert.equal(parsed.service, 'saotech-api');
  });

  it('404 Not Found returns { error: { code, message } }', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/non-existing-route',
    });

    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.payload) as { error: { code: string; message: string } };
    assert.ok(body.error);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.match(body.error.message, /not found/i);
  });

  it('Unified error handler formats exceptions as { error: { code, message } }', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/test-error',
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.payload) as { error: { code: string; message: string } };
    assert.ok(body.error);
    assert.equal(body.error.code, 'TEST_BAD_REQUEST');
    assert.equal(body.error.message, 'Intentional test error');
  });
});
