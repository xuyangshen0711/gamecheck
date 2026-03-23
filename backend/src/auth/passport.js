import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { connectToDatabase } from '../db/mongo.js';
import { verifyPassword } from './passwords.js';
import { findUserById, findUserByUsername, mapUserDocument } from './users.js';

export function configurePassport({
  databaseConnector = connectToDatabase,
} = {}) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await findUserByUsername(username, { databaseConnector });

        if (!user) {
          return done(null, false, {
            message: 'Invalid username or password.',
          });
        }

        const passwordMatches = await verifyPassword(password, user);

        if (!passwordMatches) {
          return done(null, false, {
            message: 'Invalid username or password.',
          });
        }

        return done(null, mapUserDocument(user));
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (userId, done) => {
    try {
      const user = await findUserById(userId, { databaseConnector });
      done(null, user ? mapUserDocument(user) : false);
    } catch (error) {
      done(error);
    }
  });

  return passport;
}
