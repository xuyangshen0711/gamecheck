import { connectToDatabase, closeDatabase } from '../src/db/mongo.js';

const curatedGames = [
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
  {
    name: 'Ticket to Ride',
    category: 'Strategy',
    minPlayers: 2,
    maxPlayers: 5,
    description: 'Claim railway routes and connect cities across the map.',
  },
  {
    name: 'Splendor',
    category: 'Strategy',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Become a gem merchant and build your trading empire.',
  },
];

const playerPool = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Jamie', 'Avery',
  'Parker', 'Drew', 'Sam', 'Quinn', 'Blake', 'Cameron', 'Dakota', 'Elliott',
  'Finley', 'Gray', 'Harper', 'Indigo', 'Jules', 'Kelly', 'Logan', 'Morgan',
  'Noah', 'Owen', 'Parker', 'Quinn', 'River', 'Sage', 'Taylor', 'Uma',
  'Vale', 'Wren', 'Xander', 'Yara', 'Zephyr', 'Archer', 'Bailey', 'Casey',
  'Dakota', 'Emery', 'Falcon', 'Greyson', 'Hunter', 'Indigo', 'Jude', 'Kora',
  'Lane', 'Morgan', 'Navy', 'Oliver', 'Phoenix', 'Quinn', 'Riley', 'Shadow',
];

const notesByGame = {
  Azul: [
    'Close finish with strong late-game tile placement.',
    'Fast rematch after a tied round total.',
    'New strategy around center drafting worked well.',
    'Dominant performance by the tile master.',
    'Everyone stayed competitive throughout.',
  ],
  Catan: [
    'Longest road swung the final score.',
    'Resource trading stayed friendly until the last round.',
    'A city upgrade sealed the win.',
    'Lucky dice rolls changed everything.',
    'First to 10 points with strong settlements.',
  ],
  Codenames: [
    'Team guessed aggressively and finished early.',
    'One risky clue turned the round around.',
    'Great table energy with fast back-and-forth guessing.',
    'Perfect coordination between teammates.',
    'Intense final round that came down to the wire.',
  ],
  Wingspan: [
    'Engine building paid off in the final habitat.',
    'Bonus cards decided a tight game.',
    'A strong wetland setup carried the session.',
    'Beautiful synergy between bird powers.',
    'Great balance of luck and strategy.',
  ],
  'Ticket to Ride': [
    'Completed a cross-country route successfully.',
    'Fierce competition for key railway segments.',
    'Strong point lead achieved early.',
    'Last-minute route claims changed the outcome.',
    'Excellent use of locomotive cards.',
  ],
  Splendor: [
    'Gem monopoly strategy worked brilliantly.',
    'Noble cards provided crucial bonus points.',
    'Noble points clinched the victory.',
    'Defensive play slowed down competitors.',
    'Reserved cards paid off in the end.',
  ],
};

function getRandomSubset(array, minSize, maxSize) {
  const size = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

function buildSessions(games) {
  const baseDate = new Date('2025-01-01T00:00:00.000Z');
  const sessions = [];

  // 为每个游戏生成约170条sessions，共6个游戏 = 1020条
  games.forEach((game, gameIndex) => {
    const notes = notesByGame[game.name] || ['Great session!'];
    const sessionsPerGame = 170;

    for (let index = 0; index < sessionsPerGame; index += 1) {
      // 随机选择玩家（符合游戏的最小/最大玩家数）
      const minPlayers = Math.max(2, game.minPlayers);
      const maxPlayers = Math.min(8, game.maxPlayers);
      const players = getRandomSubset(playerPool, minPlayers, maxPlayers);
      
      const winner = players[Math.floor(Math.random() * players.length)];
      
      // 分布在过去14个月
      const sessionDate = new Date(baseDate);
      const daysOffset = gameIndex * 170 + index;
      sessionDate.setUTCDate(baseDate.getUTCDate() + daysOffset);

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

async function seed() {
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
  console.log(`Database seeded with ${insertedGames.length} games and ${sessions.length} sessions.`);
  await closeDatabase();
}

seed().catch(async (error) => {
  console.error('Failed to seed database.', error);
  await closeDatabase();
  process.exit(1);
});
