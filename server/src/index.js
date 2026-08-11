import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import projectRoutes from './routes/projects.js';
import { verifyPassword, issueToken, requireAdmin, COOKIE_NAME } from './auth.js';
import { MEDIA_DIR } from './images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// In dev the Vite server (5173) calls the API (3001) cross-origin.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// ---- Auth ------------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body || {};
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const token = issueToken();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true, token });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAdmin, (_req, res) => {
  res.json({ authenticated: true });
});

// ---- API + media -----------------------------------------------------------

app.use('/api', projectRoutes);
app.use(
  '/media',
  express.static(MEDIA_DIR, {
    maxAge: '30d',
    immutable: true,
  })
);

// ---- Serve built client (production) ---------------------------------------

const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(CLIENT_DIST, { maxAge: '1h' }));

// SPA fallback (so /admin, /projects/:id etc. resolve to index.html).
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/media')) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`Ranz portfolio server running on http://localhost:${PORT}`);
});
