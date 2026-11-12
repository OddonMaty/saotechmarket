import { getConfig } from './config/env.js';
import { buildApp } from './app.js';

async function main(): Promise<void> {
  const config = getConfig();
  const app = await buildApp(config);

  try {
    const address = await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info({ address }, `Server running at ${address}`);
  } catch (err) {
    app.log.error(err, 'Failed to start server');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

