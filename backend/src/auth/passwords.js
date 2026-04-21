import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function createPasswordDigest(password) {
  const passwordSalt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, passwordSalt, KEY_LENGTH);

  return {
    passwordHash: Buffer.from(derivedKey).toString('hex'),
    passwordSalt,
  };
}

export async function verifyPassword(password, { passwordHash, passwordSalt }) {
  const derivedKey = await scrypt(password, passwordSalt, KEY_LENGTH);
  const expectedBuffer = Buffer.from(passwordHash, 'hex');
  const actualBuffer = Buffer.from(derivedKey);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
