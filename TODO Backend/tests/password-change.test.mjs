import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../dist/app.js';
import User from '../dist/modules/auth/user.model.js';
import { passwordEditSchema } from '../dist/modules/profile/profile.validations.js';
import { generateAccessToken, verifyAccessToken } from '../dist/utils/jwt.js';
import env from '../dist/config/env.js';

test('password byte limits include UTF-8 boundaries', () => {
  const valid = (password) => passwordEditSchema.safeParse({ oldPassword: 'old-password', password, confirmPassword: password }).success;
  assert.equal(valid('a'.repeat(72)), true);
  assert.equal(valid('a'.repeat(73)), false);
  assert.equal(valid('😀'.repeat(18)), true);
  assert.equal(valid('😀'.repeat(19)), false);
});

test('password changes revoke old tokens, renew this browser, and throttle attempts', async () => {
  const originalFind = User.findById;
  const originalUpdate = User.findOneAndUpdate;
  let user = {
    _id: '0123456789abcdef01234567', name: 'Test', email: 'test@example.com',
    password: await bcrypt.hash('old-password', 4), tokenVersion: 0, avatar: '',
    createdAt: new Date(), updatedAt: new Date(),
  };
  // Keep DB calls isolated; exercise the real HTTP route, bcrypt, JWTs and limiter.
  User.findById = () => {
    const query = Promise.resolve({ ...user });
    query.select = () => Promise.resolve({ ...user });
    return query;
  };
  User.findOneAndUpdate = async (filter, update) => {
    assert.equal(filter.password, user.password);
    user = { ...user, password: update.$set.password, tokenVersion: user.tokenVersion + update.$inc.tokenVersion };
    return { ...user };
  };
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  // A pre-upgrade JWT without tokenVersion is treated as version zero.
  const oldToken = jwt.sign({ userId: user._id }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
  const change = (token, oldPassword, password = 'new-password') => fetch(base + '/profile/password', {
    method: 'PATCH',
    headers: { Origin: env.CORS_ORIGIN, Cookie: `access_token=${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, password, confirmPassword: password }),
  });
  const me = (token) => fetch(base + '/auth/me', { headers: { Cookie: `access_token=${token}` } });
  try {
    assert.equal((await me(oldToken)).status, 200);
    const wrong = await change(oldToken, 'wrong-password');
    assert.equal(wrong.status, 401);
    assert.equal((await wrong.json()).code, 'WRONG_OLD_PASSWORD');
    assert.equal(user.tokenVersion, 0);
    const oversized = await change(oldToken, 'old-password', 'a'.repeat(73));
    assert.equal(oversized.status, 400);
    const result = await change(oldToken, 'old-password');
    assert.equal(result.status, 200);
    assert.equal(user.tokenVersion, 1);
    assert.equal(await bcrypt.compare('new-password', user.password), true);
    assert.equal(await bcrypt.compare('old-password', user.password), false);
    const cookie = result.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/i);
    const freshToken = cookie.match(/access_token=([^;]+)/)[1];
    assert.equal(verifyAccessToken(freshToken).tokenVersion, 1);
    assert.equal((await me(freshToken)).status, 200);
    const revoked = await me(oldToken);
    assert.equal(revoked.status, 401);
    assert.equal((await revoked.json()).code, 'AUTH_SESSION_REVOKED');
    // Tokens issued by a subsequent login must use the current version.
    assert.equal((await me(generateAccessToken({ userId: user._id, tokenVersion: user.tokenVersion }))).status, 200);
    let limited;
    for (let i = 0; i < 10; i++) {
      limited = await change(freshToken, 'wrong-password');
      if (limited.status === 429) break;
      assert.equal(limited.status, 401);
    }
    assert.equal(limited.status, 429);
    assert.equal((await limited.json()).code, 'PASSWORD_CHANGE_RATE_LIMIT_EXCEEDED');
  } finally {
    User.findById = originalFind;
    User.findOneAndUpdate = originalUpdate;
    await new Promise(resolve => server.close(resolve));
  }
});
