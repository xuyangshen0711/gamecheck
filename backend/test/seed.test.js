import assert from 'node:assert/strict';
import test from 'node:test';
import { ObjectId } from 'mongodb';
import {
  buildSessions,
  curatedGames,
  SESSIONS_PER_GAME,
} from '../scripts/seed.js';

test('main seed generates at least 1,000 synthetic records', () => {
  const mockGames = curatedGames.map((game) => ({
    ...game,
    _id: new ObjectId(),
  }));
  const sessions = buildSessions(mockGames);
  const totalRecords = mockGames.length + sessions.length;

  assert.equal(sessions.length, curatedGames.length * SESSIONS_PER_GAME);
  assert.ok(totalRecords >= 1000);
});
