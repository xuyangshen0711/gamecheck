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
    description:
      'Trade resources, expand settlements, and race for victory points.',
  },
  {
    name: 'Codenames',
    category: 'Party',
    minPlayers: 4,
    maxPlayers: 8,
    description:
      'Give clever clues and help your team uncover the right words.',
  },
  {
    name: 'Wingspan',
    category: 'Strategy',
    minPlayers: 1,
    maxPlayers: 5,
    description:
      'Build a wildlife preserve and attract birds with unique abilities.',
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
    description:
      'Work together as disease specialists to stop global outbreaks.',
  },
  {
    name: 'Splendor',
    category: 'Engine Building',
    minPlayers: 2,
    maxPlayers: 4,
    description:
      'Gather gem tokens, buy cards, and attract nobles for prestige.',
  },
  {
    name: 'Carcassonne',
    category: 'Tile Placement',
    minPlayers: 2,
    maxPlayers: 5,
    description:
      'Place landscape tiles and followers to build a medieval countryside.',
  },
  {
    name: '7 Wonders',
    category: 'Card Drafting',
    minPlayers: 3,
    maxPlayers: 7,
    description:
      'Draft cards across three ages and build the strongest civilization.',
  },
  {
    name: 'Dominion',
    category: 'Deck Building',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Build a powerful deck and optimize every turn for points.',
  },
  {
    name: 'Cascadia',
    category: 'Puzzle',
    minPlayers: 1,
    maxPlayers: 4,
    description:
      'Balance habitats and wildlife tokens in a calm spatial puzzle.',
  },
  {
    name: 'Dixit',
    category: 'Party',
    minPlayers: 3,
    maxPlayers: 6,
    description: 'Tell imaginative clues and guess the storyteller’s card.',
  },
  {
    name: 'The Crew',
    category: 'Cooperative',
    minPlayers: 2,
    maxPlayers: 5,
    description: 'Complete mission-based trick-taking tasks as a team.',
  },
  {
    name: 'Sushi Go!',
    category: 'Card Drafting',
    minPlayers: 2,
    maxPlayers: 5,
    description: 'Draft cute sushi combos for quick and satisfying scoring.',
  },
  {
    name: 'King of Tokyo',
    category: 'Dice',
    minPlayers: 2,
    maxPlayers: 6,
    description: 'Roll dice, battle monsters, and become the ruler of Tokyo.',
  },
  {
    name: 'Patchwork',
    category: 'Abstract',
    minPlayers: 2,
    maxPlayers: 2,
    description: 'Fit fabric pieces efficiently to build the best quilt.',
  },
  {
    name: 'Root',
    category: 'Strategy',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Lead an asymmetric woodland faction to victory.',
  },
  {
    name: 'Jaipur',
    category: 'Card Game',
    minPlayers: 2,
    maxPlayers: 2,
    description: 'Trade goods efficiently in a sharp two-player market duel.',
  },
  {
    name: 'Heat: Pedal to the Metal',
    category: 'Racing',
    minPlayers: 1,
    maxPlayers: 6,
    description: 'Manage speed, corners, and upgrades in a tense racing game.',
  },
  {
    name: 'Scout',
    category: 'Card Game',
    minPlayers: 2,
    maxPlayers: 5,
    description: 'Sequence your hand cleverly in a compact climbing card game.',
  },
  {
    name: 'Hanabi',
    category: 'Cooperative',
    minPlayers: 2,
    maxPlayers: 5,
    description: 'Work together to build fireworks using hidden information.',
  },
  {
    name: 'Forbidden Island',
    category: 'Cooperative',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Recover treasures and escape before the island sinks.',
  },
  {
    name: 'Sequence',
    category: 'Family',
    minPlayers: 2,
    maxPlayers: 6,
    description: 'Play cards and form rows of chips on the board.',
  },
  {
    name: 'Everdell',
    category: 'Worker Placement',
    minPlayers: 1,
    maxPlayers: 4,
    description: 'Build a woodland city with careful worker and card timing.',
  },
];

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
  'Harper',
  'Logan',
  'Rowan',
  'Cameron',
  'Skyler',
  'Reese',
  'Emerson',
  'Blake',
  'Hayden',
  'Finley',
  'Sydney',
  'Kendall',
];

const notesByCategory = {
  Abstract: [
    'A careful late-game pattern made the difference.',
    'Every small placement mattered in the final score.',
    'A clean tactical plan held up all the way through scoring.',
  ],
  Strategy: [
    'Long-term planning beat a stronger early start.',
    'One smart pivot in the middle game changed the outcome.',
    'The winner built a steady advantage and never gave it back.',
  ],
  Party: [
    'The table got loud almost immediately and stayed that way.',
    'One clue changed the tone of the whole round.',
    'Fast guesses kept the pace high from start to finish.',
  ],
  Family: [
    'Everyone stayed close until the final scoring reveal.',
    'A simple plan executed well beat the flashier play.',
    'The table learned quickly and asked for a rematch.',
  ],
  Cooperative: [
    'The team recovered from a rough opening and stabilized late.',
    'Communication stayed tight under pressure.',
    'A last-turn save kept the mission alive.',
  ],
  'Engine Building': [
    'A smooth economy engine paid off in the closing turns.',
    'The winner stacked discounts early and never slowed down.',
    'A strong final round turned setup into points efficiently.',
  ],
  'Tile Placement': [
    'One flexible tile created the best scoring window of the game.',
    'Meeple timing decided more than anyone expected.',
    'The board looked calm until the last scoring swing.',
  ],
  'Card Drafting': [
    'Table reads mattered as much as the cards themselves.',
    'The strongest lane stayed open just long enough.',
    'Quick decisions kept the drafting rounds moving smoothly.',
  ],
  'Deck Building': [
    'A lean deck outperformed the greedier build.',
    'Treasure timing and action chains lined up well.',
    'The winner stayed disciplined and kept the deck efficient.',
  ],
  Puzzle: [
    'A balanced approach outscored a narrow specialization.',
    'Small positional edges added up over time.',
    'The best final layout was only obvious at the end.',
  ],
  Dice: [
    'A few aggressive rerolls created a dramatic finish.',
    'Risky attacks worked just enough to swing momentum.',
    'The table stayed tense every time the dice hit the board.',
  ],
  'Card Game': [
    'Hand management mattered more than raw tempo.',
    'A patient line paid off once the scoring windows opened.',
    'The turning point came from one well-timed exchange.',
  ],
  Racing: [
    'Heat management separated the front runners from the pack.',
    'A bold cornering line paid off in the last lap.',
    'The race stayed close until the final push.',
  ],
  'Worker Placement': [
    'Resource pressure made every worker placement matter.',
    'The winner built a flexible engine without wasting actions.',
    'A stronger final season closed out the table cleanly.',
  ],
};

const defaultNotes = [
  'The game stayed competitive all the way through the final scoring step.',
  'A steady plan and a calm finish earned the win.',
  'Momentum shifted more than once before the last round settled it.',
];

function buildPlayers(game, gameIndex, sessionIndex) {
  const minPlayers = Math.max(1, Number(game.minPlayers) || 1);
  const maxPlayers = Math.max(
    minPlayers,
    Math.min(Number(game.maxPlayers) || minPlayers, 6)
  );
  const playerCount =
    minPlayers + ((gameIndex + sessionIndex) % (maxPlayers - minPlayers + 1));
  const startIndex = (gameIndex * 7 + sessionIndex * 3) % playerPool.length;
  const players = [];

  for (let index = 0; index < playerCount; index += 1) {
    players.push(playerPool[(startIndex + index) % playerPool.length]);
  }

  return players;
}

export function buildSessions(games) {
  const baseDate = new Date('2025-01-01T00:00:00.000Z');
  const sessions = [];

  games.forEach((game, gameIndex) => {
    const notes = notesByCategory[game.category] || defaultNotes;

    for (
      let sessionIndex = 0;
      sessionIndex < SESSIONS_PER_GAME;
      sessionIndex += 1
    ) {
      const players = buildPlayers(game, gameIndex, sessionIndex);
      const winner = players[(gameIndex + sessionIndex * 2) % players.length];
      const sessionDate = new Date(baseDate);
      sessionDate.setUTCDate(
        baseDate.getUTCDate() + gameIndex * SESSIONS_PER_GAME + sessionIndex
      );

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
  const insertedGames = await gamesCollection
    .find({})
    .sort({ name: 1 })
    .toArray();
  const sessions = buildSessions(insertedGames);

  await sessionsCollection.insertMany(sessions);
  console.log(
    `Database seeded with ${insertedGames.length} games and ${sessions.length} sessions (${insertedGames.length + sessions.length} total records).`
  );
  await closeDatabase();
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  seed().catch(async (error) => {
    console.error('Failed to seed database.', error);
    await closeDatabase();
    process.exit(1);
  });
}
