import { ObjectId } from 'mongodb';
import express from 'express';
import { connectToDatabase } from '../db/mongo.js';
import { validateGamePayload } from '../utils/validators.js';

const router = express.Router();

function mapGameDocument(document) {
  return {
    id: document._id.toString(),
    name: document.name,
    category: document.category,
    minPlayers: document.minPlayers,
    maxPlayers: document.maxPlayers,
    description: document.description || '',
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

router.get('/', async (req, res) => {
  const db = await connectToDatabase();
  const search = req.query.search?.trim();
  const query = search
    ? {
        name: {
          $regex: search,
          $options: 'i',
        },
      }
    : {};

  const games = await db
    .collection('games')
    .find(query)
    .sort({ name: 1 })
    .toArray();
  return res.json(games.map(mapGameDocument));
});

router.post('/', async (req, res) => {
  const errors = validateGamePayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const now = new Date();
  const document = {
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    minPlayers: Number(req.body.minPlayers),
    maxPlayers: Number(req.body.maxPlayers),
    description: req.body.description?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  const db = await connectToDatabase();
  const result = await db.collection('games').insertOne(document);
  const createdGame = await db
    .collection('games')
    .findOne({ _id: result.insertedId });
  return res.status(201).json(mapGameDocument(createdGame));
});

router.put('/:gameId', async (req, res) => {
  if (!ObjectId.isValid(req.params.gameId)) {
    return res.status(400).json({ error: 'Invalid game id.' });
  }

  const errors = validateGamePayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const db = await connectToDatabase();
  const gameObjectId = new ObjectId(req.params.gameId);
  const updateDocument = {
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    minPlayers: Number(req.body.minPlayers),
    maxPlayers: Number(req.body.maxPlayers),
    description: req.body.description?.trim() || '',
    updatedAt: new Date(),
  };
  const result = await db.collection('games').updateOne(
    { _id: gameObjectId },
    {
      $set: updateDocument,
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Game not found.' });
  }

  const updatedGame = await db
    .collection('games')
    .findOne({ _id: gameObjectId });
  return res.json(mapGameDocument(updatedGame));
});

router.delete('/:gameId', async (req, res) => {
  if (!ObjectId.isValid(req.params.gameId)) {
    return res.status(400).json({ error: 'Invalid game id.' });
  }

  const db = await connectToDatabase();
  const gameObjectId = new ObjectId(req.params.gameId);
  const sessionsCount = await db
    .collection('sessions')
    .countDocuments({ gameId: req.params.gameId });

  if (sessionsCount > 0) {
    return res.status(400).json({
      error:
        'This game is referenced by existing sessions and cannot be deleted yet.',
    });
  }

  const result = await db.collection('games').deleteOne({ _id: gameObjectId });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Game not found.' });
  }

  return res.sendStatus(204);
});

export default router;
