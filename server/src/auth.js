// Password-based admin auth.
//
// The admin password is configured via ADMIN_PASSWORD (plain, hashed on boot)
// or ADMIN_PASSWORD_HASH (a bcrypt hash). A signed JWT is issued on login and
// sent back as an httpOnly cookie; the admin API requires a valid token.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'change-me-in-production-ranz-portfolio-secret';
const TOKEN_TTL = '7d';
export const COOKIE_NAME = 'ranz_admin';

// Resolve the password hash once at startup.
let PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
if (!PASSWORD_HASH) {
  const plain = process.env.ADMIN_PASSWORD || 'ranz-admin';
  PASSWORD_HASH = bcrypt.hashSync(plain, 10);
}

export function verifyPassword(password) {
  if (!password) return false;
  return bcrypt.compareSync(password, PASSWORD_HASH);
}

export function issueToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function isValidToken(token) {
  if (!token) return false;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

/** Express middleware guarding admin routes. */
export function requireAdmin(req, res, next) {
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const token = req.cookies?.[COOKIE_NAME] || bearer;
  if (isValidToken(token)) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}
