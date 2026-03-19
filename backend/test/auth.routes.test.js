import assert from 'node:assert/strict';
import test from 'node:test';
import passport from 'passport';
import { ObjectId } from 'mongodb';
import { createPasswordDigest, verifyPassword } from '../src/auth/passwords.js';
import { configurePassport } from '../src/auth/passport.js';
import { requireAuthenticatedUser } from '../src/middleware/auth.js';
import { createAuthRouter } from '../src/routes/auth.js';

function createFakeDatabase({ users = [] } = {}) {
  const userDocuments = users.map((user) => ({ ...user }));

  return {
    collection(name) {
      if (name !== 'users') {
        throw new Error(`Unexpected collection: ${name}`);
      }

      return {
        async createIndex() {
          return 'username_1';
        },
        async findOne(query) {
          if (query._id) {
            return (
              userDocuments.find((user) => user._id.toString() === query._id.toString()) || null
            );
          }

          if (query.username) {
            return userDocuments.find((user) => user.username === query.username) || null;
          }

          return null;
        },
        async insertOne(document) {
          const existingUser = userDocuments.find((user) => user.username === document.username);

          if (existingUser) {
            const error = new Error('Duplicate username.');
            error.code = 11000;
            throw error;
          }

          const insertedId = new ObjectId();
          userDocuments.push({ _id: insertedId, ...document });
          return { insertedId };
        },
      };
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

async function invokeRoute(handler, req) {
  const response = {
    statusCode: 200,
    body: undefined,
    clearedCookieName: '',
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    clearCookie(name) {
      this.clearedCookieName = name;
      return this;
    },
  };

  let nextError = null;
  await handler(req, response, (error) => {
    nextError = error || null;
  });

  if (nextError) {
    throw nextError;
  }

  return response;
}

test('createPasswordDigest and verifyPassword validate the supplied password', async () => {
  const digest = await createPasswordDigest('strongpass123');

  assert.ok(await verifyPassword('strongpass123', digest));
  assert.equal(await verifyPassword('wrongpass123', digest), false);
});

test('POST /api/auth/register creates a normalized user and logs them in', async () => {
  const database = createFakeDatabase();
  const router = createAuthRouter({
    databaseConnector: async () => database,
  });
  const handler = getRouteHandler(router, 'post', '/register');
  let loggedInUser = null;
  const response = await invokeRoute(handler, {
    body: {
      username: 'Gaoyuan',
      password: 'strongpass123',
    },
    logIn(user, callback) {
      loggedInUser = user;
      callback();
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.user.username, 'gaoyuan');
  assert.equal(loggedInUser.username, 'gaoyuan');
});

test('passport local strategy accepts valid credentials and rejects invalid ones', async () => {
  const passwordDigest = await createPasswordDigest('averysecurepass');
  const database = createFakeDatabase({
    users: [
      {
        _id: new ObjectId(),
        username: 'xuyang',
        ...passwordDigest,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  configurePassport({
    databaseConnector: async () => database,
  });

  const strategy = passport._strategy('local');
  const validResult = await new Promise((resolve, reject) => {
    strategy._verify('xuyang', 'averysecurepass', (error, user, info) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ user, info });
    });
  });

  assert.equal(validResult.user.username, 'xuyang');
  assert.equal(validResult.info, undefined);

  const invalidResult = await new Promise((resolve, reject) => {
    strategy._verify('xuyang', 'wrongpass', (error, user, info) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ user, info });
    });
  });

  assert.equal(invalidResult.user, false);
  assert.equal(invalidResult.info.message, 'Invalid username or password.');
});

test('requireAuthenticatedUser blocks anonymous requests', () => {
  let nextCalled = false;
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
  };

  requireAuthenticatedUser(
    {
      isAuthenticated() {
        return false;
      },
    },
    response,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, 'Authentication required.');
});
