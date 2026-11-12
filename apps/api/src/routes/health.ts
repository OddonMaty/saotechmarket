import type { FastifyPluginAsync } from 'fastify';
import { HealthResponseSchema, type HealthResponse } from '@saotech/shared';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_request, reply) => {
    const data: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'saotech-api',
      uptime: process.uptime(),
      version: '0.1.0',
    };

    // Validate with shared schema
    const validated = HealthResponseSchema.parse(data);
    return reply.status(200).send(validated);
  });
};

