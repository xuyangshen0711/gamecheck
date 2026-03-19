import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { configurePassport } from './auth/passport.js';
import gamesRouter from './routes/games.js';
import sessionsRouter from './routes/sessions.js';
import statsRouter from './routes/stats.js';
import authRouter from './routes/auth.js';
import { env } from './config/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { requireAuthenticatedUser } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const sessionMiddleware = session({
  name: 'gamecheck.sid',
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: env.mongoUri,
    dbName: env.mongoDbName,
    collectionName: 'authSessions',
  }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
  },
});

configurePassport();

export function createApp() {
  const app = express();

  if (env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/games', requireAuthenticatedUser, gamesRouter);
  app.use('/api/sessions', requireAuthenticatedUser, sessionsRouter);
  app.use('/api/stats', requireAuthenticatedUser, statsRouter);

  if (existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }

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
