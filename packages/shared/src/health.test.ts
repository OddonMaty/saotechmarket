import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HealthResponseSchema } from './health.js';

describe('HealthResponseSchema', () => {
  it('validates a correct health payload', () => {
    const payload = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      service: 'saotech-api',
      uptime: 12.34,
      version: '0.1.0',
    };

    const parsed = HealthResponseSchema.parse(payload);
    assert.equal(parsed.status, 'ok');
    assert.equal(parsed.service, 'saotech-api');
  });

  it('rejects an invalid status or missing field', () => {
    assert.throws(() => {
      HealthResponseSchema.parse({
        status: 'degraded',
        timestamp: 'invalid-date',
      });
    });
  });
});

