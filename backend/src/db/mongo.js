import { MongoClient } from 'mongodb';
import { env } from '../config/env.js';

const client = new MongoClient(env.mongoUri);
let databasePromise;

export async function connectToDatabase() {
  if (!databasePromise) {
    databasePromise = client
      .connect()
      .then((connectedClient) => connectedClient.db(env.mongoDbName));
  }

  return databasePromise;
}

export async function closeDatabase() {
  databasePromise = null;
  await client.close();
}
