import { pathToFileURL } from 'url';
import { connectToDatabase, closeDatabase } from '../src/db/mongo.js';

export const SESSIONS_PER_GAME = 260;

export const curatedGames = [
  {
    name: 'Azul',
    category: 'Abstract',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Draft colorful tiles and build the most elegant mosaic.',
  },
  {
    name: 'Catan',
    category: 'Strategy',
    minPlayers: 3,
    maxPlayers: 4,
    description: 'Trade resources, expand settlements, and race for victory points.',
  },
  {
    name: 'Codenames',
    category: 'Party',
    minPlayers: 4,
    maxPlayers: 8,
    description: 'Give clever clues and help your team uncover the right words.',
  },
  {
    name: 'Wingspan',
    category: 'Strategy',
    minPlayers: 1,
    maxPlayers: 5,
    description: 'Build a wildlife preserve and attract birds with unique abilities.',
  },
];

// Higher weight = wins more often in that game (creates skewed win rate distribution)
const winWeightsByGame = {
  Azul:      { Alex: 2, Jordan: 2, Taylor: 1, Morgan: 5, Riley: 1, Casey: 2, Jamie: 1, Avery: 4, Parker: 2, Drew: 1, Sam: 2, Quinn: 3 },
  Catan:     { Alex: 1, Jordan: 3, Taylor: 2, Morgan: 2, Riley: 5, Casey: 4, Jamie: 2, Avery: 1, Parker: 4, Drew: 2, Sam: 1, Quinn: 2 },
  Codenames: { Alex: 2, Jordan: 1, Taylor: 5, Morgan: 3, Riley: 2, Casey: 1, Jamie: 3, Avery: 2, Parker: 1, Drew: 5, Sam: 4, Quinn: 1 },
  Wingspan:  { Alex: 2, Jordan: 4, Taylor: 2, Morgan: 5, Riley: 3, Casey: 1, Jamie: 2, Avery: 2, Parker: 1, Drew: 2, Sam: 4, Quinn: 1 },
};

// All 12 players distributed across groups — every player appears in every game.
// Heavier players appear in more groups; lighter players fewer. Group sizes vary for realism.
const playerGroupsByGame = {
  Azul: [
    ['Alex', 'Jordan', 'Morgan', 'Taylor'],
    ['Riley', 'Casey', 'Jamie'],
    ['Avery', 'Parker', 'Alex'],
    ['Drew', 'Sam', 'Quinn', 'Morgan'],
    ['Alex', 'Taylor', 'Riley', 'Avery'],
    ['Jordan', 'Casey', 'Drew', 'Parker'],
    ['Jamie', 'Quinn', 'Sam', 'Alex'],
    ['Morgan', 'Avery', 'Jordan', 'Taylor'],
    ['Riley', 'Parker', 'Drew'],
    ['Casey', 'Jamie', 'Quinn', 'Alex'],
    ['Sam', 'Drew', 'Jordan'],
    ['Avery', 'Taylor', 'Morgan', 'Riley'],
  ],
  Catan: [
    ['Alex', 'Jordan', 'Taylor', 'Morgan'],
    ['Riley', 'Casey', 'Jamie', 'Parker'],
    ['Avery', 'Drew', 'Sam', 'Quinn'],
    ['Alex', 'Riley', 'Avery', 'Jordan'],
    ['Jordan', 'Casey', 'Drew', 'Morgan'],
    ['Taylor', 'Jamie', 'Sam', 'Parker'],
    ['Quinn', 'Alex', 'Riley', 'Casey'],
    ['Jordan', 'Drew', 'Jamie', 'Morgan'],
    ['Morgan', 'Avery', 'Sam', 'Taylor'],
    ['Parker', 'Quinn', 'Alex', 'Jordan'],
    ['Riley', 'Morgan', 'Drew', 'Casey'],
    ['Jamie', 'Sam', 'Avery', 'Quinn'],
  ],
  Codenames: [
    ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley'],
    ['Casey', 'Jamie', 'Avery', 'Parker', 'Drew'],
    ['Sam', 'Quinn', 'Alex', 'Casey', 'Morgan'],
    ['Jordan', 'Riley', 'Drew', 'Jamie', 'Avery'],
    ['Taylor', 'Parker', 'Sam', 'Quinn', 'Alex'],
    ['Morgan', 'Casey', 'Jordan', 'Drew', 'Riley'],
    ['Riley', 'Jamie', 'Avery', 'Sam', 'Taylor'],
    ['Quinn', 'Parker', 'Alex', 'Morgan', 'Casey'],
    ['Jordan', 'Drew', 'Riley', 'Jamie', 'Quinn'],
    ['Avery', 'Sam', 'Quinn', 'Taylor', 'Parker'],
    ['Alex', 'Morgan', 'Drew', 'Casey', 'Jordan', 'Riley'],
    ['Jamie', 'Avery', 'Sam', 'Quinn', 'Taylor', 'Parker'],
  ],
  Wingspan: [
    ['Alex', 'Jordan', 'Taylor'],
    ['Morgan', 'Riley', 'Casey', 'Jamie'],
    ['Avery', 'Parker', 'Drew', 'Sam'],
    ['Quinn', 'Alex', 'Morgan', 'Jordan'],
    ['Jordan', 'Avery', 'Riley', 'Parker'],
    ['Taylor', 'Casey', 'Drew', 'Quinn'],
    ['Sam', 'Jamie', 'Alex', 'Morgan'],
    ['Riley', 'Parker', 'Jordan', 'Quinn'],
    ['Drew', 'Avery', 'Casey', 'Taylor'],
    ['Quinn', 'Sam', 'Jamie', 'Alex'],
    ['Morgan', 'Riley', 'Drew', 'Parker'],
    ['Jordan', 'Taylor', 'Avery', 'Quinn'],
  ],
};

const notesByGame = {
  Azul: [
    'Close finish with strong late-game tile placement.',
    'Fast rematch after a tied round total.',
    'New strategy around center drafting worked well.',
    'Corner tiles made all the difference.',
    'Aggressive center play paid off big.',
    'Defensive tile blocking changed the entire outcome.',
  ],
  Catan: [
    'Longest road swung the final score.',
    'Resource trading stayed friendly until the last round.',
    'A city upgrade sealed the win.',
    'Ports were ignored for too long.',
    'Robber pressure kept one player down all game.',
    'Desert placement turned out to be the key decision.',
  ],
  Codenames: [
    'Team guessed aggressively and finished early.',
    'One risky clue turned the round around.',
    'Great table energy with fast back-and-forth guessing.',
    'A double-meaning clue nearly ended the game early.',
    'Spymaster played it safe and it paid off.',
    'Last clue was completely obvious in hindsight.',
  ],
  Wingspan: [
    'Engine building paid off in the final habitat.',
    'Bonus cards decided a tight game.',
    'A strong wetland setup carried the session.',
    'Grassland birds dominated the late rounds.',
    'Forest engine came online just in time.',
    'Bird power combos led to a runaway finish.',
  ],
};

function selectWinner(players, gameName, seed) {
  const weights = winWeightsByGame[gameName] || {};
  const playerWeights = players.map((p) => weights[p] || 1);
  const totalWeight = playerWeights.reduce((sum, w) => sum + w, 0);

  // Deterministic weighted pick — same seed always gives same winner
  const hash = ((seed * 1664525 + 1013904223) & 0x7fffffff) % totalWeight;
  let running = 0;
  for (let i = 0; i < players.length; i++) {
    running += playerWeights[i];
    if (hash < running) return players[i];
  }
  return players[players.length - 1];
}

export function buildSessions(games) {
  const baseDate = new Date('2024-01-01T00:00:00.000Z');
  const sessions = [];

  games.forEach((game, gameIndex) => {
    const playerGroups = playerGroupsByGame[game.name];
    const notes = notesByGame[game.name];

    for (let index = 0; index < SESSIONS_PER_GAME; index += 1) {
      const players = playerGroups[index % playerGroups.length];
      const winner = selectWinner(players, game.name, index * 4 + gameIndex);
      const sessionDate = new Date(baseDate);
      sessionDate.setUTCDate(baseDate.getUTCDate() + index * 3 + gameIndex * 5);

      sessions.push({
        gameId: game._id.toString(),
        gameName: game.name,
        sessionDate: sessionDate.toISOString().slice(0, 10),
        players,
        winner,
        notes: notes[index % notes.length],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return sessions;
}

export async function seed() {
  const db = await connectToDatabase();
  const gamesCollection = db.collection('games');
  const sessionsCollection = db.collection('sessions');

  await gamesCollection.deleteMany({});
  await sessionsCollection.deleteMany({});

  const now = new Date();
  const gamesToInsert = curatedGames.map((game) => ({
    ...game,
    createdAt: now,
    updatedAt: now,
  }));

  await gamesCollection.insertMany(gamesToInsert);
  const insertedGames = await gamesCollection.find({}).sort({ name: 1 }).toArray();
  const sessions = buildSessions(insertedGames);

  await sessionsCollection.insertMany(sessions);
  console.log(
    `Database seeded with ${insertedGames.length} games and ${sessions.length} sessions (${insertedGames.length + sessions.length} total records).`
  );
  await closeDatabase();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed().catch(async (error) => {
    console.error('Failed to seed database.', error);
    await closeDatabase();
    process.exit(1);
  });
}
