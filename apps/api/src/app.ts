import fastify, { type FastifyInstance, type FastifyError } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import type { EnvConfig } from './config/env.js';
import { healthRoutes } from './routes/health.js';

export async function buildApp(config: EnvConfig): Promise<FastifyInstance> {
  const isDev = config.NODE_ENV === 'development';

  const app = fastify({
    logger: {
      level: isDev ? 'debug' : 'info',
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["set-cookie"]',
          '*.password',
          '*.password_hash',
          '*.token',
          '*.secret',
          '*.key',
        ],
        censor: '[REDACTED]',
      },
    },
    trustProxy: true,
  });

  // Security headers
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production',
  });

  // CORS limited to configured web origin
  await app.register(fastifyCors, {
    origin: [config.WEB_ORIGIN],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global rate limit
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Unique global error handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode =
      typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 600
        ? error.statusCode
        : 500;

    const code =
      typeof error.code === 'string' && error.code !== ''
        ? error.code
        : statusCode === 500
        ? 'INTERNAL_SERVER_ERROR'
        : 'BAD_REQUEST';

    const message =
      statusCode === 500 && config.NODE_ENV === 'production'
        ? 'Une erreur interne est survenue.'
        : error.message || 'Une erreur est survenue.';

    request.log.error(
      {
        err: {
          name: error.name,
          message: error.message,
          stack: isDev ? error.stack : undefined,
        },
        statusCode,
        code,
      },
      'Request error caught by global error handler'
    );

    return reply.status(statusCode).send({
      error: {
        code,
        message,
      },
    });
  });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    });
  });

  // Routes
  await app.register(healthRoutes);

  return app;
}

