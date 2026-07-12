# Ranz Bontogon — Portfolio (React)

A rebuild of the Ranz Bontogon photography portfolio as a React single-page app
with an admin editor and a one-time image-compression pipeline. It keeps the
original look — black background, Cubao display type, grayscale-to-colour hover
galleries — while making it faster, cleaner, and editable without touching code.

## What's here

```
client/      React + TypeScript app (Vite)
server/      Express API, admin auth, image pipeline (sharp)
images/      Original photos — the source the compressor reads from
legacy/      The original static HTML/CSS site, kept for reference
```

## Key features

- **Faithful redesign** of the home, about, projects, project, and contact pages,
  plus a sticky responsive header and a mobile menu.
- **Fast images.** Every photo is compressed **once** into three sizes:
  - a tiny inline blur placeholder shown instantly,
  - a `thumb.webp` used in galleries / previews,
  - a `full.webp` loaded **only** when a photo is opened in the lightbox.
  704&nbsp;MB of originals compress to ~57&nbsp;MB of web assets.
- **Lightbox** with keyboard navigation, neighbour prefetching, and blur-up.
- **Admin** at `/admin` — password login, then edit every project: title,
  caption, one link, and add / remove / reorder photos and pick the cover.
  Uploaded photos are compressed on the server automatically.

## Getting started

```bash
# 1. install both packages
npm run install:all

# 2. compress the images once (writes server/data + server/media)
npm run precompress

# 3a. run in development (two terminals)
npm run dev:server     # API on :3001
npm run dev:client     # app on http://localhost:5173

# 3b. …or build and run everything from one server
npm run build
npm start              # serves the built app + API on http://localhost:3001
```

`npm run setup` does install + precompress + build in one go.

## Admin

Visit `/admin` and sign in. Configure the password and session secret via
environment variables (see `.env.example`) — put them in `server/.env` or your
host's env settings:

| Variable              | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `ADMIN_PASSWORD`      | Admin login password (default `ranz-admin`)        |
| `ADMIN_PASSWORD_HASH` | Optional pre-hashed password (overrides the above) |
| `JWT_SECRET`          | Secret used to sign the admin session cookie       |
| `PORT`                | Server port (default `3001`)                       |
| `NODE_ENV`            | Set to `production` when deploying                  |

**Change `ADMIN_PASSWORD` and `JWT_SECRET` before deploying.**

## How content is stored

- `server/data/projects.json` — editable content (titles, captions, links,
  image order, covers). Admin edits write here.
- `server/data/manifest.json` — maps each image id to its compressed
  derivatives and dimensions.
- `server/media/<id>/` — the generated `thumb.webp` and `full.webp` files.

Re-running `npm run precompress` regenerates both JSON files from
`server/data/seed.js`, resetting content to the seed — run it once to bootstrap,
then manage content through `/admin`.

## Deployment notes

The original static site was hosted on a static host. Because the admin now
persists edits and compresses uploads, the app needs a **Node host** (Render,
Railway, Fly.io, a VPS, etc.). Build with `npm run build` and run `npm start`;
the Express server serves the built client, the API, and the media. The contact
and subscribe forms still post to web3forms, so they work without extra backend
wiring.

## Credits

- **Ranz Jaren Tayo Bontogon** — artist and content provider.
- Original static site by **Anthony Arseneau**.
