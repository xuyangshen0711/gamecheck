import { connectToDatabase, closeDatabase } from '../src/db/mongo.js';

const categories = [
  'Strategy',
  'Party',
  'Cooperative',
  'Card Game',
  'Deduction',
  'Family',
  'Abstract',
  'Dice Game',
];

const adjectives = [
  'Silver',
  'Hidden',
  'Rapid',
  'Epic',
  'Silent',
  'Crimson',
  'Golden',
  'Electric',
];

const nouns = [
  'Alliance',
  'Kingdom',
  'Circuit',
  'Quest',
  'Harbor',
  'Cipher',
  'Expedition',
  'Arena',
];

const playerNames = [
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
];

function buildGame(index) {
  const adjective = adjectives[index % adjectives.length];
  const noun = nouns[index % nouns.length];
  const minPlayers = (index % 4) + 2;
  const maxPlayers = minPlayers + (index % 3) + 1;

  return {
    name: `${adjective} ${noun} ${index + 1}`,
    category: categories[index % categories.length],
    minPlayers,
    maxPlayers,
    description: `A synthetic catalog entry for ${adjective} ${noun} ${index + 1}.`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function pickPlayers(count, offset) {
  const players = [];

  for (let index = 0; index < count; index += 1) {
    players.push(playerNames[(offset + index) % playerNames.length]);
  }

  return players;
}

async function seed() {
  const db = await connectToDatabase();
  const gamesCollection = db.collection('games');
  const sessionsCollection = db.collection('sessions');

  await gamesCollection.deleteMany({});
  await sessionsCollection.deleteMany({});

  const games = Array.from({ length: 250 }, (_, index) => buildGame(index));
  const gameInsertResult = await gamesCollection.insertMany(games);
  const insertedGameIds = Object.values(gameInsertResult.insertedIds);

  const sessions = Array.from({ length: 800 }, (_, index) => {
    const gameIndex = index % insertedGameIds.length;
    const game = games[gameIndex];
    const playerCount = game.minPlayers + (index % (game.maxPlayers - game.minPlayers + 1));
    const players = pickPlayers(playerCount, index);
    const winner = players[index % players.length];
    const sessionDate = new Date(2025, index % 12, (index % 28) + 1).toISOString().slice(0, 10);

    return {
      gameId: insertedGameIds[gameIndex].toString(),
      gameName: game.name,
      sessionDate,
      players,
      winner,
      notes: `Synthetic session ${index + 1}.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  await sessionsCollection.insertMany(sessions);
  console.log('Database seeded with 250 games and 800 sessions.');
  await closeDatabase();
}

seed().catch(async (error) => {
  console.error('Failed to seed database.', error);
  await closeDatabase();
  process.exit(1);
});
