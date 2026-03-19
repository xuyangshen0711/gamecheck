import { connectToDatabase, closeDatabase } from '../src/db/mongo.js';

const playerPool = [
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Riley',
  'Casey',
  'Jamie',
  'Avery',
  'Parker',
  'Drew',
  'Sam',
  'Quinn',
];

const fallbackGames = [
  {
    name: 'Catan',
    category: 'Strategy',
    minPlayers: 3,
    maxPlayers: 4,
    description: 'Sample game for local statistics testing.',
  },
  {
    name: 'Azul',
    category: 'Abstract',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Sample game for local statistics testing.',
  },
  {
    name: 'Wingspan',
    category: 'Strategy',
    minPlayers: 1,
    maxPlayers: 5,
    description: 'Sample game for local statistics testing.',
  },
  {
    name: 'Codenames',
    category: 'Party',
    minPlayers: 4,
    maxPlayers: 8,
    description: 'Sample game for local statistics testing.',
  },
];

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function pickUniquePlayers(minPlayers, maxPlayers) {
  const shuffled = [...playerPool].sort(() => Math.random() - 0.5);
  const count = minPlayers + randomInt(maxPlayers - minPlayers + 1);
  return shuffled.slice(0, count);
}

function pickWinner(players) {
  const weightedPool = [
    players[0],
    players[0],
    players[1] || players[0],
    ...players,
  ].filter(Boolean);

  return weightedPool[randomInt(weightedPool.length)];
}

function buildSession(game, index) {
  const minPlayers = Math.max(2, Number(game.minPlayers) || 2);
  const maxPlayers = Math.max(minPlayers, Number(game.maxPlayers) || minPlayers);
  const players = pickUniquePlayers(minPlayers, Math.min(maxPlayers, 6));
  const winner = pickWinner(players);
  const sessionDate = new Date(2026, 1 + randomInt(2), 1 + randomInt(28)).toISOString().slice(0, 10);

  return {
    gameId: game._id.toString(),
    gameName: game.name,
    sessionDate,
    players,
    winner,
    notes: `Sample stats session ${index + 1}.`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function seedStatsSample() {
  const db = await connectToDatabase();
  const gamesCollection = db.collection('games');
  const sessionsCollection = db.collection('sessions');
  let games = await gamesCollection.find({}).toArray();

  if (games.length === 0) {
    const now = new Date();
    const fallbackDocuments = fallbackGames.map((game) => ({
      ...game,
      createdAt: now,
      updatedAt: now,
    }));

    await gamesCollection.insertMany(fallbackDocuments);
    games = await gamesCollection.find({}).toArray();
  }

  const targetGames = [...games].sort(() => Math.random() - 0.5).slice(0, Math.min(games.length, 6));
  const sessions = Array.from({ length: 24 }, (_, index) => {
    const game = targetGames[index % targetGames.length];
    return buildSession(game, index);
  });

  await sessionsCollection.insertMany(sessions);
  console.log(`Inserted ${sessions.length} sample sessions across ${targetGames.length} games.`);
}

seedStatsSample()
  .catch(async (error) => {
    console.error('Failed to insert sample stats sessions.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
