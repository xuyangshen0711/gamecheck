import { ObjectId } from 'mongodb';
import express from 'express';
import { connectToDatabase } from '../db/mongo.js';
import { validateSessionPayload } from '../utils/validators.js';

const router = express.Router();

function mapSessionDocument(document) {
  return {
    id: document._id.toString(),
    gameId: document.gameId,
    gameName: document.gameName,
    sessionDate: document.sessionDate,
    players: document.players,
    winner: document.winner,
    notes: document.notes || '',
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

router.get('/', async (req, res) => {
  const db = await connectToDatabase();
  const filters = {};

  if (req.query.gameId?.trim()) {
    filters.gameId = req.query.gameId.trim();
  }

  if (req.query.player?.trim()) {
    filters.players = {
      $elemMatch: {
        $regex: `^${req.query.player.trim()}$`,
        $options: 'i',
      },
    };
  }

  const sessions = await db.collection('sessions').find(filters).sort({ sessionDate: -1 }).toArray();
  return res.json(sessions.map(mapSessionDocument));
});

router.post('/', async (req, res) => {
  const errors = validateSessionPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const db = await connectToDatabase();

  if (!ObjectId.isValid(req.body.gameId)) {
    return res.status(400).json({ errors: ['Selected game id is invalid.'] });
  }

  const game = await db.collection('games').findOne({ _id: new ObjectId(req.body.gameId) });

  if (!game) {
    return res.status(400).json({ errors: ['Selected game does not exist.'] });
  }

  const now = new Date();
  const normalizedPlayers = req.body.players.map((player) => player.trim()).filter(Boolean);
  const winner = req.body.winner.trim();
  const document = {
    gameId: req.body.gameId,
    gameName: game.name,
    sessionDate: req.body.sessionDate,
    players: normalizedPlayers,
    winner,
    notes: req.body.notes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('sessions').insertOne(document);
  const createdSession = await db.collection('sessions').findOne({ _id: result.insertedId });
  return res.status(201).json(mapSessionDocument(createdSession));
});

router.put('/:sessionId', async (req, res) => {
  if (!ObjectId.isValid(req.params.sessionId)) {
    return res.status(400).json({ error: 'Invalid session id.' });
  }

  const errors = validateSessionPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const db = await connectToDatabase();

  if (!ObjectId.isValid(req.body.gameId)) {
    return res.status(400).json({ errors: ['Selected game id is invalid.'] });
  }

  const game = await db.collection('games').findOne({ _id: new ObjectId(req.body.gameId) });

  if (!game) {
    return res.status(400).json({ errors: ['Selected game does not exist.'] });
  }

  const normalizedPlayers = req.body.players.map((player) => player.trim()).filter(Boolean);
  const winner = req.body.winner.trim();
  const sessionObjectId = new ObjectId(req.params.sessionId);
  const result = await db.collection('sessions').updateOne(
    { _id: sessionObjectId },
    {
      $set: {
        gameId: req.body.gameId,
        gameName: game.name,
        sessionDate: req.body.sessionDate,
        players: normalizedPlayers,
        winner,
        notes: req.body.notes?.trim() || '',
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  const updatedSession = await db.collection('sessions').findOne({ _id: sessionObjectId });
  return res.json(mapSessionDocument(updatedSession));
});

router.delete('/:sessionId', async (req, res) => {
  if (!ObjectId.isValid(req.params.sessionId)) {
    return res.status(400).json({ error: 'Invalid session id.' });
  }

  const db = await connectToDatabase();
  const result = await db.collection('sessions').deleteOne({
    _id: new ObjectId(req.params.sessionId),
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  return res.sendStatus(204);
});

export default router;
