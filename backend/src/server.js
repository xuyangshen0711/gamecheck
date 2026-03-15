import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectToDatabase } from './db/mongo.js';

const app = createApp();

async function startServer() {
  await connectToDatabase();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`GameCheck backend listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server.', error);
  process.exit(1);
});
