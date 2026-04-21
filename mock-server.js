import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// Mock data
const mockGames = [
  {
    id: '1',
    name: 'Azul',
    category: 'Abstract',
    minPlayers: 2,
    maxPlayers: 4,
    description: 'Draft colorful tiles and build the most elegant mosaic.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Catan',
    category: 'Strategy',
    minPlayers: 3,
    maxPlayers: 4,
    description: 'Trade resources, expand settlements, and race for victory points.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Codenames',
    category: 'Party',
    minPlayers: 4,
    maxPlayers: 8,
    description: 'Give clever clues and help your team uncover the right words.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockSessions = [
  {
    id: '1',
    gameId: '1',
    gameName: 'Azul',
    sessionDate: '2026-04-15',
    players: ['Alice', 'Bob', 'Charlie'],
    winner: 'Alice',
    notes: 'Great game! Alice dominated with her tile placement strategy.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    gameId: '2',
    gameName: 'Catan',
    sessionDate: '2026-04-14',
    players: ['Alice', 'Bob', 'Diana'],
    winner: 'Bob',
    notes: 'Bob got the longest road and won with 10 points.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    gameId: '3',
    gameName: 'Codenames',
    sessionDate: '2026-04-13',
    players: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    winner: 'Alice',
    notes: 'Team Alice won with a perfect score!',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Mock auth endpoints
app.get('/api/auth/me', (req, res) => {
  res.json({
    id: '1',
    username: 'demo',
    displayName: 'Demo User',
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    id: '1',
    username: 'demo',
    displayName: 'Demo User',
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    id: '1',
    username: 'demo',
    displayName: 'Demo User',
  });
});

// Games endpoints
app.get('/api/games', (req, res) => {
  const search = req.query.search?.toLowerCase() || '';
  const filteredGames = mockGames.filter(game =>
    game.name.toLowerCase().includes(search) ||
    game.category.toLowerCase().includes(search)
  );
  res.json(filteredGames);
});

app.post('/api/games', (req, res) => {
  const newGame = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockGames.push(newGame);
  res.status(201).json(newGame);
});

app.put('/api/games/:id', (req, res) => {
  const gameIndex = mockGames.findIndex(g => g.id === req.params.id);
  if (gameIndex === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }
  mockGames[gameIndex] = { ...mockGames[gameIndex], ...req.body, updatedAt: new Date() };
  res.json(mockGames[gameIndex]);
});

app.delete('/api/games/:id', (req, res) => {
  const gameIndex = mockGames.findIndex(g => g.id === req.params.id);
  if (gameIndex === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }
  mockGames.splice(gameIndex, 1);
  res.status(204).send();
});

// Sessions endpoints
app.get('/api/sessions', (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const pageSize = 50;
  const gameId = req.query.gameId;
  const player = req.query.player;

  let filteredSessions = mockSessions;

  if (gameId) {
    filteredSessions = filteredSessions.filter(s => s.gameId === gameId);
  }

  if (player) {
    filteredSessions = filteredSessions.filter(s =>
      s.players.some(p => p.toLowerCase().includes(player.toLowerCase()))
    );
  }

  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  res.json({
    sessions: paginatedSessions,
    pagination: {
      page,
      pageSize,
      total: filteredSessions.length,
      totalPages: Math.ceil(filteredSessions.length / pageSize),
    },
  });
});

app.post('/api/sessions', (req, res) => {
  const newSession = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockSessions.push(newSession);
  res.status(201).json(newSession);
});

app.put('/api/sessions/:id', (req, res) => {
  const sessionIndex = mockSessions.findIndex(s => s.id === req.params.id);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }
  mockSessions[sessionIndex] = { ...mockSessions[sessionIndex], ...req.body, updatedAt: new Date() };
  res.json(mockSessions[sessionIndex]);
});

app.delete('/api/sessions/:id', (req, res) => {
  const sessionIndex = mockSessions.findIndex(s => s.id === req.params.id);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }
  mockSessions.splice(sessionIndex, 1);
  res.status(204).send();
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  const player = req.query.player;
  const sessions = player ?
    mockSessions.filter(s => s.players.some(p => p.toLowerCase().includes(player.toLowerCase()))) :
    mockSessions;

  const stats = {
    dashboard: {
      totalSessions: sessions.length,
      totalGames: [...new Set(sessions.map(s => s.gameId))].length,
      totalPlayers: [...new Set(sessions.flatMap(s => s.players))].length,
    },
    winRates: [
      { player: 'Alice', wins: 2, total: 3, percentage: 66.7 },
      { player: 'Bob', wins: 1, total: 3, percentage: 33.3 },
      { player: 'Charlie', wins: 0, total: 2, percentage: 0 },
    ],
    mostPlayedGames: [
      { name: 'Azul', sessions: 1 },
      { name: 'Catan', sessions: 1 },
      { name: 'Codenames', sessions: 1 },
    ],
    streaks: {
      current: [],
      longest: [],
    },
    headToHead: [],
  };

  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🚀 Mock GameCheck API server running on http://localhost:${PORT}`);
  console.log(`📊 Mock data: ${mockGames.length} games, ${mockSessions.length} sessions`);
});