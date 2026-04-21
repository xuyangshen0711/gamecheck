import express from 'express';
import { connectToDatabase } from '../db/mongo.js';

function calculatePercentage(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(1));
}

function compareBySessionDateDescending(left, right) {
  return right.sessionDate.localeCompare(left.sessionDate);
}

function compareBySessionDateAscending(left, right) {
  return left.sessionDate.localeCompare(right.sessionDate);
}

function getTopEntry(entries, valueSelector) {
  return [...entries].sort((left, right) => {
    const rightValue = valueSelector(right);
    const leftValue = valueSelector(left);

    if (rightValue !== leftValue) {
      return rightValue - leftValue;
    }

    return String(left.name || left.player || left.label).localeCompare(
      String(right.name || right.player || right.label)
    );
  })[0] || null;
}

function buildWinRates(sessions, minimumSessions = 1) {
  const appearancesByPlayer = new Map();
  const winsByPlayer = new Map();

  sessions.forEach((session) => {
    session.players.forEach((player) => {
      appearancesByPlayer.set(player, (appearancesByPlayer.get(player) || 0) + 1);
    });

    winsByPlayer.set(session.winner, (winsByPlayer.get(session.winner) || 0) + 1);
  });

  return [...appearancesByPlayer.entries()]
    .map(([player, appearances]) => {
      const wins = winsByPlayer.get(player) || 0;
      return {
        player,
        wins,
        appearances,
        winRate: calculatePercentage(wins, appearances),
      };
    })
    .filter((entry) => entry.appearances >= minimumSessions)
    .sort((left, right) => {
      if (right.winRate !== left.winRate) {
        return right.winRate - left.winRate;
      }

      if (right.wins !== left.wins) {
        return right.wins - left.wins;
      }

      return left.player.localeCompare(right.player);
    });
}

function buildMostPlayedGames(sessions) {
  const counts = new Map();

  sessions.forEach((session) => {
    const existing = counts.get(session.gameId) || {
      gameId: session.gameId,
      name: session.gameName,
      sessionsPlayed: 0,
      lastPlayedAt: session.sessionDate,
    };

    existing.sessionsPlayed += 1;

    if (session.sessionDate > existing.lastPlayedAt) {
      existing.lastPlayedAt = session.sessionDate;
    }

    counts.set(session.gameId, existing);
  });

  return [...counts.values()].sort((left, right) => {
    if (right.sessionsPlayed !== left.sessionsPlayed) {
      return right.sessionsPlayed - left.sessionsPlayed;
    }

    if (right.lastPlayedAt !== left.lastPlayedAt) {
      return right.lastPlayedAt.localeCompare(left.lastPlayedAt);
    }

    return left.name.localeCompare(right.name);
  });
}

function buildPlayerStreaks(sessions) {
  const sessionsByPlayer = new Map();

  sessions.forEach((session) => {
    session.players.forEach((player) => {
      const entries = sessionsByPlayer.get(player) || [];
      entries.push(session);
      sessionsByPlayer.set(player, entries);
    });
  });

  const current = [];
  const longest = [];

  sessionsByPlayer.forEach((playerSessions, player) => {
    const descending = [...playerSessions].sort(compareBySessionDateDescending);
    let currentStreak = 0;

    for (const session of descending) {
      if (session.winner !== player) {
        break;
      }

      currentStreak += 1;
    }

    current.push({
      player,
      streak: currentStreak,
      latestAppearanceDate: descending[0]?.sessionDate || null,
    });

    const ascending = [...playerSessions].sort(compareBySessionDateAscending);
    let longestStreak = 0;
    let streakStartDate = null;
    let streakEndDate = null;
    let runningStreak = 0;
    let runningStartDate = null;

    ascending.forEach((session) => {
      if (session.winner === player) {
        runningStreak += 1;
        runningStartDate = runningStartDate || session.sessionDate;

        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
          streakStartDate = runningStartDate;
          streakEndDate = session.sessionDate;
        }

        return;
      }

      runningStreak = 0;
      runningStartDate = null;
    });

    longest.push({
      player,
      streak: longestStreak,
      startDate: streakStartDate,
      endDate: streakEndDate,
    });
  });

  const sortByStreak = (left, right) => {
    if (right.streak !== left.streak) {
      return right.streak - left.streak;
    }

    return left.player.localeCompare(right.player);
  };

  return {
    current: current.sort(sortByStreak),
    longest: longest.sort(sortByStreak),
  };
}

function buildHeadToHead(sessions, focusPlayer = '') {
  const rivalries = new Map();

  sessions.forEach((session) => {
    const uniquePlayers = [...new Set(session.players)].sort((left, right) =>
      left.localeCompare(right)
    );

    for (let index = 0; index < uniquePlayers.length; index += 1) {
      for (let innerIndex = index + 1; innerIndex < uniquePlayers.length; innerIndex += 1) {
        const leftPlayer = uniquePlayers[index];
        const rightPlayer = uniquePlayers[innerIndex];

        if (focusPlayer && leftPlayer !== focusPlayer && rightPlayer !== focusPlayer) {
          continue;
        }

        const key = `${leftPlayer}::${rightPlayer}`;
        const existing = rivalries.get(key) || {
          key,
          players: [leftPlayer, rightPlayer],
          meetings: 0,
          wins: {
            [leftPlayer]: 0,
            [rightPlayer]: 0,
          },
          lastPlayedAt: session.sessionDate,
        };

        existing.meetings += 1;

        if (session.winner === leftPlayer || session.winner === rightPlayer) {
          existing.wins[session.winner] += 1;
        }

        if (session.sessionDate > existing.lastPlayedAt) {
          existing.lastPlayedAt = session.sessionDate;
        }

        rivalries.set(key, existing);
      }
    }
  });

  return [...rivalries.values()]
    .map((rivalry) => {
      const [leftPlayer, rightPlayer] = rivalry.players;
      const leftWins = rivalry.wins[leftPlayer];
      const rightWins = rivalry.wins[rightPlayer];
      const leader =
        leftWins === rightWins ? 'Tied' : leftWins > rightWins ? leftPlayer : rightPlayer;

      return {
        players: rivalry.players,
        meetings: rivalry.meetings,
        wins: rivalry.wins,
        leader,
        lastPlayedAt: rivalry.lastPlayedAt,
      };
    })
    .sort((left, right) => {
      if (right.meetings !== left.meetings) {
        return right.meetings - left.meetings;
      }

      return right.lastPlayedAt.localeCompare(left.lastPlayedAt);
    });
}

export function buildStatisticsPayload({ gamesCount, sessions, focusPlayer = '' }) {
  const normalizedSessions = [...sessions].sort(compareBySessionDateDescending);
  const filteredSessions = focusPlayer
    ? normalizedSessions.filter((session) => session.players.includes(focusPlayer))
    : normalizedSessions;
  const uniquePlayers = new Set(filteredSessions.flatMap((session) => session.players));
  const winRates = buildWinRates(filteredSessions);
  const mostPlayedGames = buildMostPlayedGames(filteredSessions);
  const streaks = buildPlayerStreaks(filteredSessions);
  const headToHead = buildHeadToHead(filteredSessions, focusPlayer);
  const dashboard = {
    gamesTracked: gamesCount,
    sessionsLogged: filteredSessions.length,
    playersTracked: uniquePlayers.size,
    latestWinner: filteredSessions[0]?.winner || null,
    mostPlayedGame: getTopEntry(mostPlayedGames, (entry) => entry.sessionsPlayed),
    bestWinRate: getTopEntry(winRates, (entry) => entry.winRate),
    hottestStreak: getTopEntry(
      streaks.current.filter((entry) => entry.streak > 0),
      (entry) => entry.streak
    ),
    busiestRivalry: getTopEntry(headToHead, (entry) => entry.meetings),
  };

  return {
    dashboard,
    winRates,
    mostPlayedGames,
    streaks,
    headToHead,
  };
}

export function createStatsRouter({ databaseConnector = connectToDatabase } = {}) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const db = await databaseConnector();
    const focusPlayer = req.query.player?.trim() || '';
    const focusGameId = req.query.gameId?.trim() || '';
    const sessionFilter = {};
    if (focusPlayer) sessionFilter.players = focusPlayer;
    if (focusGameId) sessionFilter.gameId = focusGameId;
    const [gamesCount, sessions] = await Promise.all([
      db.collection('games').countDocuments(),
      db.collection('sessions').find(sessionFilter).sort({ sessionDate: -1 }).toArray(),
    ]);

    return res.json(buildStatisticsPayload({ gamesCount, sessions, focusPlayer }));
  });

  return router;
}

export default createStatsRouter();
