import express from 'express';
import gamesRouter from './routes/games.js';
import sessionsRouter from './routes/sessions.js';
import { corsMiddleware } from './middleware/cors.js';

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/games', gamesRouter);
  app.use('/api/sessions', sessionsRouter);

  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }

    return next(err);
  });

  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error.' });
  });

  return app;
}
