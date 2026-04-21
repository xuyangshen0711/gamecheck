import { env } from '../config/env.js';

function getAllowedOrigins() {
  const configuredOrigins = (env.frontendOrigin || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...configuredOrigins, 'http://localhost:5173', 'http://127.0.0.1:5173'])];
}

export function corsMiddleware(req, res, next) {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
  } else if (allowedOrigins[0]) {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
}
