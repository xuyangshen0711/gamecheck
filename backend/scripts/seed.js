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
    category: 'Family',
    minPlayers: 2,
    maxPlayers: 5,
    description: 'Collect train cards and claim railway routes across the map.',
  },
  {
    name: 'Pandemic',
    category: 'Cooperative',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Work together as disease specialists to stop global outbreaks.',
  },
  {
    name: 'Splendor',
    category: 'Engine Building',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Gather gem tokens, buy cards, and attract nobles for prestige.',
  },
  {
    name: 'Carcassonne',
    category: 'Tile Placement',
    minPlayers: 2,
    maxPlayers: 5,
    description: 'Place landscape tiles and followers to build a medieval countryside.',
  },
];

const sharedPlayerGroups = [
  ['Alex', 'Jordan'],
  ['Taylor', 'Morgan', 'Riley'],
  ['Casey', 'Jamie', 'Avery', 'Parker'],
  ['Drew', 'Sam', 'Quinn', 'Alex', 'Jordan'],
  ['Riley', 'Casey', 'Jamie', 'Avery', 'Parker', 'Morgan'],
];

const notesByCategory = {
  Abstract: [
    'A careful final round of tile drafting decided the winner.',
    'Pattern building paid off after a tight mid-game score.',
    'One risky move opened the door for a late comeback.',
  ],
  Strategy: [
    'A long-term engine plan finally pulled ahead in the endgame.',
    'Table talk stayed calm until one swing turn changed everything.',
    'A small efficiency edge held up through the final scoring round.',
  ],
  Party: [
    'The table stayed loud from the opening clue to the final guess.',
    'One bold call changed the entire pace of the round.',
    'Fast teamwork and confident guesses wrapped this one up quickly.',
  ],
  Family: [
    'Route planning in the middle game made the difference.',
    'A blocked connection forced a creative backup plan.',
    'The final tickets revealed a much closer game than expected.',
  ],
  Cooperative: [
    'The team stabilized the board just before the game spiraled.',
    'Role coordination mattered more than any single lucky draw.',
    'A tense final turn barely kept the outbreak chain under control.',
  ],
  'Engine Building': [
    'A strong early economy turned into a smooth prestige finish.',
    'Noble pressure changed the buying priorities halfway through.',
    'Small card discounts stacked into a decisive late-game burst.',
  ],
  'Tile Placement': [
    'Meeple timing created a surprise scoring swing near the end.',
    'A single tile draw opened up two great placement options.',
    'Field scoring flipped the leaderboard after a quiet start.',
  ],
};

const defaultNotes = [
  'A close game stayed competitive until the final scoring step.',
  'The table settled into a good rhythm after the opening turns.',
  'A late momentum swing gave the winner just enough breathing room.',
];

function getPlayerGroupsForGame(game) {
  return sharedPlayerGroups.filter(
    (group) => group.length >= game.minPlayers && group.length <= game.maxPlayers
  );
}

function buildSessions(games) {
  const baseDate = new Date('2026-03-01T00:00:00.000Z');
  const sessions = [];

  games.forEach((game, gameIndex) => {
    const playerGroups = getPlayerGroupsForGame(game);
    const notes = notesByCategory[game.category] || defaultNotes;

    for (let index = 0; index < 6; index += 1) {
      const players = playerGroups[index % playerGroups.length];
      const winner = players[(index + gameIndex) % players.length];
      const sessionDate = new Date(baseDate);
      sessionDate.setUTCDate(baseDate.getUTCDate() + gameIndex * 6 + index);

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
