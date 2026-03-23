import assert from 'node:assert/strict';
import test from 'node:test';
import { ObjectId } from 'mongodb';
import { createSessionsRouter } from '../src/routes/sessions.js';

function createFakeDatabase({ games = [], sessions = [] } = {}) {
  const gameDocuments = games.map((game) => ({ ...game }));
  const sessionDocuments = sessions.map((session) => ({ ...session }));

  return {
    collection(name) {
      if (name === 'games') {
        return {
          async findOne(query) {
            if (!query._id) {
              return null;
            }

            return (
              gameDocuments.find(
                (game) => game._id.toString() === query._id.toString()
              ) || null
            );
          },
        };
      }

      if (name === 'sessions') {
        return {
          find(filters = {}) {
            let results = sessionDocuments.filter((session) => {
              if (filters.gameId && session.gameId !== filters.gameId) {
                return false;
              }

              if (filters.players?.$elemMatch?.$regex) {
                const matcher = new RegExp(
                  filters.players.$elemMatch.$regex,
                  filters.players.$elemMatch.$options
                );

                return session.players.some((player) => matcher.test(player));
              }

              return true;
            });

            return {
              sort(sortDefinition) {
                if (sortDefinition.sessionDate === -1) {
                  results = [...results].sort((left, right) =>
                    right.sessionDate.localeCompare(left.sessionDate)
                  );
                }

                return {
                  async toArray() {
                    return results.map((session) => ({ ...session }));
                  },
                };
              },
            };
          },
          async insertOne(document) {
            const insertedId = new ObjectId();
            sessionDocuments.push({ _id: insertedId, ...document });
            return { insertedId };
          },
          async findOne(query) {
            return (
              sessionDocuments.find(
                (session) => session._id.toString() === query._id.toString()
              ) || null
            );
          },
          async updateOne(query, update) {
            const session = sessionDocuments.find(
              (candidate) => candidate._id.toString() === query._id.toString()
            );

            if (!session) {
              return { matchedCount: 0 };
            }

            Object.assign(session, update.$set);
            return { matchedCount: 1 };
          },
          async deleteOne(query) {
            const index = sessionDocuments.findIndex(
              (candidate) => candidate._id.toString() === query._id.toString()
            );

            if (index === -1) {
              return { deletedCount: 0 };
            }

            sessionDocuments.splice(index, 1);
            return { deletedCount: 1 };
          },
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    },
  };
}

function getRouteHandler(router, method, path) {
  const routeLayer = router.stack.find(
    (layer) => layer.route?.path === path && layer.route.methods[method]
  );

  if (!routeLayer) {
    throw new Error(`Unable to find route ${method.toUpperCase()} ${path}`);
  }

  return routeLayer.route.stack[0].handle;
}

async function invokeRoute(
  handler,
  { body = {}, params = {}, query = {} } = {}
) {
  const req = {
    body,
    params,
    query,
  };
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    sendStatus(code) {
      this.statusCode = code;
      return this;
    },
  };

  await handler(req, response);

  return response;
}

test('GET /api/sessions escapes player filters before querying', async () => {
  const database = createFakeDatabase({
    sessions: [
      {
        _id: new ObjectId(),
        gameId: '507f1f77bcf86cd799439011',
        gameName: 'Codenames',
        sessionDate: '2026-03-17',
        players: ['Alex[1]', 'Jordan'],
        winner: 'Alex[1]',
        notes: '',
      },
      {
        _id: new ObjectId(),
        gameId: '507f1f77bcf86cd799439011',
        gameName: 'Codenames',
        sessionDate: '2026-03-16',
        players: ['Alex11', 'Jordan'],
        winner: 'Alex11',
        notes: '',
      },
    ],
  });
  const router = createSessionsRouter({
    databaseConnector: async () => database,
  });
  const handler = getRouteHandler(router, 'get', '/');
  const response = await invokeRoute(handler, {
    query: {
      player: 'Alex[1]',
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].winner, 'Alex[1]');
});

test('POST /api/sessions creates a session with trimmed players', async () => {
  const gameId = new ObjectId();
  const database = createFakeDatabase({
    games: [
      {
        _id: gameId,
        name: 'Wingspan',
      },
    ],
  });
  const router = createSessionsRouter({
    databaseConnector: async () => database,
  });
  const handler = getRouteHandler(router, 'post', '/');
  const response = await invokeRoute(handler, {
    body: {
      gameId: gameId.toString(),
      sessionDate: '2026-03-17',
      players: [' Alex ', 'Jordan'],
      winner: 'Alex',
      notes: 'Close finish.',
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.gameName, 'Wingspan');
  assert.deepEqual(response.body.players, ['Alex', 'Jordan']);
  assert.equal(response.body.winner, 'Alex');
});
