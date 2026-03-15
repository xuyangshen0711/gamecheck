import { env } from '../config/env.js';

export function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', env.frontendOrigin);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
}
