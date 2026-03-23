import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../db/mongo.js';

const COLLECTION_NAME = 'users';

export function normalizeUsername(username = '') {
  return username.trim().toLowerCase();
}

export function mapUserDocument(document) {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    username: document.username,
    createdAt: document.createdAt,
  };
}

export async function ensureUserIndexes({ databaseConnector = connectToDatabase } = {}) {
  const db = await databaseConnector();
  await db.collection(COLLECTION_NAME).createIndex({ username: 1 }, { unique: true });
}

export async function findUserById(userId, { databaseConnector = connectToDatabase } = {}) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const db = await databaseConnector();
  return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(userId) });
}

export async function findUserByUsername(username, { databaseConnector = connectToDatabase } = {}) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  const db = await databaseConnector();
  return db.collection(COLLECTION_NAME).findOne({ username: normalizedUsername });
}

export async function createUser(
  { username, passwordHash, passwordSalt },
  { databaseConnector = connectToDatabase } = {}
) {
  const db = await databaseConnector();
  const now = new Date();
  const document = {
    username: normalizeUsername(username),
    passwordHash,
    passwordSalt,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection(COLLECTION_NAME).insertOne(document);
  return { ...document, _id: result.insertedId };
}
