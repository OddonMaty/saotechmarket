import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from './config/env.js';

describe('Environment validation', () => {
  it('fails to start when required environment variables are missing', () => {
    assert.throws(() => {
      // Missing WEB_ORIGIN, DATABASE_URL, API_SECRET
      parseEnv({});
    }, /Missing or invalid environment variables/);
  });

  it('fails when API_SECRET is too short (< 16 chars)', () => {
    assert.throws(() => {
      parseEnv({
        WEB_ORIGIN: 'http://localhost:3000',
        DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
        API_SECRET: 'short',
      });
    }, /API_SECRET must be at least 16 characters/);
  });

  it('succeeds with valid variables and applies defaults', () => {
    const config = parseEnv({
      WEB_ORIGIN: 'http://localhost:3000',
      DATABASE_URL: 'mysql://user:pass@localhost:3306/saotech_market',
      API_SECRET: 'super_secure_secret_1234567890',
    });

    assert.equal(config.NODE_ENV, 'development');
    assert.equal(config.PORT, 4000);
    assert.equal(config.HOST, '0.0.0.0');
    assert.equal(config.WEB_ORIGIN, 'http://localhost:3000');
  });
});

