import { pathToFileURL } from 'url';
import { connectToDatabase, closeDatabase } from '../src/db/mongo.js';

export const SESSIONS_PER_GAME = 50;

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

const playerGroupsByGame = {
  Azul: [
    ['Alex', 'Jordan'],
    ['Taylor', 'Morgan', 'Riley'],
    ['Casey', 'Jamie', 'Avery', 'Parker'],
  ],
  Catan: [
    ['Alex', 'Jordan', 'Taylor'],
    ['Morgan', 'Riley', 'Casey', 'Jamie'],
    ['Avery', 'Parker', 'Drew', 'Sam'],
  ],
  Codenames: [
    ['Alex', 'Jordan', 'Taylor', 'Morgan'],
    ['Riley', 'Casey', 'Jamie', 'Avery', 'Parker', 'Drew'],
    ['Sam', 'Quinn', 'Alex', 'Jamie', 'Morgan', 'Taylor'],
  ],
  Wingspan: [
    ['Parker'],
    ['Jordan', 'Riley', 'Taylor'],
    ['Alex', 'Drew', 'Jamie', 'Avery'],
  ],
};

const notesByGame = {
  Azul: [
    'Close finish with strong late-game tile placement.',
    'Fast rematch after a tied round total.',
    'New strategy around center drafting worked well.',
  ],
  Catan: [
    'Longest road swung the final score.',
    'Resource trading stayed friendly until the last round.',
    'A city upgrade sealed the win.',
  ],
  Codenames: [
    'Team guessed aggressively and finished early.',
    'One risky clue turned the round around.',
    'Great table energy with fast back-and-forth guessing.',
  ],
  Wingspan: [
    'Engine building paid off in the final habitat.',
    'Bonus cards decided a tight game.',
    'A strong wetland setup carried the session.',
  ],
};

function buildSessions(games) {
  const baseDate = new Date('2026-03-01T00:00:00.000Z');
  const sessions = [];

  // 为每个游戏生成约170条sessions，共6个游戏 = 1020条
  games.forEach((game, gameIndex) => {
    const playerGroups = playerGroupsByGame[game.name];
    const notes = notesByGame[game.name];

    for (let index = 0; index < 8; index += 1) {
      const players = playerGroups[index % playerGroups.length];
      const winner = players[(index + gameIndex) % players.length];
      const sessionDate = new Date(baseDate);
      sessionDate.setUTCDate(baseDate.getUTCDate() + gameIndex * 8 + index);

      sessions.push({
        gameId: game._id.toString(),
        gameName: game.name,
        sessionDate: sessionDate.toISOString().slice(0, 10),
        players,
        winner,
        notes: notes[sessionIndex % notes.length],
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
