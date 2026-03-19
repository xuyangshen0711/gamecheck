import express from 'express';
import passport from 'passport';
import { createPasswordDigest } from '../auth/passwords.js';
import {
  createUser,
  ensureUserIndexes,
  findUserByUsername,
  mapUserDocument,
  normalizeUsername,
} from '../auth/users.js';
import { connectToDatabase } from '../db/mongo.js';

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
const SESSION_COOKIE_NAME = 'gamecheck.sid';

function validateCredentials({ username = '', password = '' }) {
  const normalizedUsername = normalizeUsername(username);
  const trimmedPassword = password.trim();
  const errors = [];

  if (normalizedUsername.length < MIN_USERNAME_LENGTH) {
    errors.push(`Username must be at least ${MIN_USERNAME_LENGTH} characters long.`);
  }

  if (!/^[a-z0-9._-]+$/i.test(normalizedUsername)) {
    errors.push('Username may only include letters, numbers, periods, underscores, and hyphens.');
  }

  if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }

  return errors;
}

function respondWithUser(res, user, statusCode = 200) {
  return res.status(statusCode).json({ user: mapUserDocument(user) });
}

export function createAuthRouter({ databaseConnector = connectToDatabase } = {}) {
  const router = express.Router();

  router.get('/me', (req, res) => {
    return res.json({ user: req.user || null });
  });

  router.post('/register', async (req, res, next) => {
    const errors = validateCredentials(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      await ensureUserIndexes({ databaseConnector });

      const existingUser = await findUserByUsername(req.body.username, { databaseConnector });

      if (existingUser) {
        return res.status(409).json({ error: 'That username is already in use.' });
      }

      const passwordDigest = await createPasswordDigest(req.body.password.trim());
      const createdUser = await createUser(
        {
          username: req.body.username,
          ...passwordDigest,
        },
        { databaseConnector }
      );

      return req.logIn(mapUserDocument(createdUser), (error) => {
        if (error) {
          return next(error);
        }

        return respondWithUser(res, createdUser, 201);
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'That username is already in use.' });
      }

      return next(error);
    }
  });

  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(401).json({ error: info?.message || 'Invalid username or password.' });
      }

      return req.logIn(user, (loginError) => {
        if (loginError) {
          return next(loginError);
        }

        return res.json({ user });
      });
    })(req, res, next);
  });

  router.post('/logout', (req, res, next) => {
    req.logout((logoutError) => {
      if (logoutError) {
        return next(logoutError);
      }

      if (!req.session) {
        res.clearCookie(SESSION_COOKIE_NAME);
        return res.json({ ok: true });
      }

      return req.session.destroy((sessionError) => {
        if (sessionError) {
          return next(sessionError);
        }

        res.clearCookie(SESSION_COOKIE_NAME);
        return res.json({ ok: true });
      });
    });
  });

  return router;
}

export default createAuthRouter();
