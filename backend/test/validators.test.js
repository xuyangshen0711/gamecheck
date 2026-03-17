import assert from 'node:assert/strict';
import test from 'node:test';
import { validateGamePayload, validateSessionPayload } from '../src/utils/validators.js';

test('validateGamePayload rejects invalid player counts', () => {
  const errors = validateGamePayload({
    name: 'Catan',
    category: 'Strategy',
    minPlayers: 4,
    maxPlayers: 2,
    description: '',
  });

  assert.deepEqual(errors, [
    'Maximum players must be an integer greater than or equal to minimum players.',
  ]);
});

test('validateSessionPayload catches duplicate players and invalid winner', () => {
  const errors = validateSessionPayload({
    gameId: '507f1f77bcf86cd799439011',
    sessionDate: '2026-03-17',
    players: ['Alex', ' alex ', 'Jordan'],
    winner: 'Taylor',
    notes: '',
  });

  assert.deepEqual(errors, [
    'Player names must be unique within a session.',
    'Winner must match one of the players in the session.',
  ]);
});
