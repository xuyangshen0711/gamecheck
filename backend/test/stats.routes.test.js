import assert from 'node:assert/strict';
import test from 'node:test';
import { buildStatisticsPayload } from '../src/routes/stats.js';

const sessions = [
  {
    gameId: 'g1',
    gameName: 'Catan',
    sessionDate: '2026-03-10',
    players: ['Alex', 'Jordan', 'Sam'],
    winner: 'Alex',
  },
  {
    gameId: 'g1',
    gameName: 'Catan',
    sessionDate: '2026-03-12',
    players: ['Alex', 'Jordan', 'Sam'],
    winner: 'Jordan',
  },
  {
    gameId: 'g2',
    gameName: 'Azul',
    sessionDate: '2026-03-13',
    players: ['Alex', 'Jordan'],
    winner: 'Jordan',
  },
  {
    gameId: 'g3',
    gameName: 'Heat',
    sessionDate: '2026-03-15',
    players: ['Alex', 'Taylor'],
    winner: 'Alex',
  },
  {
    gameId: 'g3',
    gameName: 'Heat',
    sessionDate: '2026-03-16',
    players: ['Alex', 'Taylor'],
    winner: 'Alex',
  },
];

test('buildStatisticsPayload returns dashboard, win rates, streaks, and rivalries', () => {
  const statistics = buildStatisticsPayload({
    gamesCount: 3,
    sessions,
  });

  assert.equal(statistics.dashboard.gamesTracked, 3);
  assert.equal(statistics.dashboard.sessionsLogged, 5);
  assert.equal(statistics.dashboard.playersTracked, 4);
  assert.equal(statistics.dashboard.latestWinner, 'Alex');
  assert.equal(statistics.dashboard.mostPlayedGame.name, 'Catan');
  assert.equal(statistics.dashboard.bestWinRate.player, 'Jordan');
  assert.equal(statistics.dashboard.hottestStreak.player, 'Alex');
  assert.equal(statistics.dashboard.hottestStreak.streak, 2);
  assert.deepEqual(statistics.winRates[0], {
    player: 'Jordan',
    wins: 2,
    appearances: 3,
    winRate: 66.7,
  });
  assert.equal(statistics.mostPlayedGames[0].name, 'Heat');
  assert.equal(statistics.mostPlayedGames[0].sessionsPlayed, 2);
  assert.equal(statistics.streaks.current[0].player, 'Alex');
  assert.equal(statistics.streaks.current[0].streak, 2);
  assert.equal(statistics.streaks.longest[0].player, 'Alex');
  assert.equal(statistics.streaks.longest[0].streak, 2);
  assert.deepEqual(statistics.headToHead[0], {
    players: ['Alex', 'Jordan'],
    meetings: 3,
    wins: {
      Alex: 1,
      Jordan: 2,
    },
    leader: 'Jordan',
    lastPlayedAt: '2026-03-13',
  });
});

test('buildStatisticsPayload filters head to head results by focus player', () => {
  const statistics = buildStatisticsPayload({
    gamesCount: 3,
    sessions,
    focusPlayer: 'Taylor',
  });

  assert.equal(statistics.headToHead.length, 1);
  assert.deepEqual(statistics.headToHead[0].players, ['Alex', 'Taylor']);
  assert.equal(statistics.headToHead[0].meetings, 2);
});
