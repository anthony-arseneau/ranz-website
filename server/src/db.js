// Tiny JSON-file data layer.
//
// projects.json  -> editable content (titles, captions, links, image order)
// manifest.json  -> map of imageId -> derivative info (thumb/full/lqip/dims)
//
// Writes are serialized through a promise chain so concurrent admin saves
// can't clobber each other.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const MANIFEST_FILE = path.join(DATA_DIR, 'manifest.json');

let writeChain = Promise.resolve();

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function getManifest() {
  return readJson(MANIFEST_FILE, {});
}

export async function saveManifest(manifest) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

export async function getData() {
  return readJson(PROJECTS_FILE, { projects: [], mosaic: [], profile: null, background: null });
}

/** Serialized read-modify-write. `mutator(data)` may be async and returns the new data. */
export function updateData(mutator) {
  writeChain = writeChain.then(async () => {
    const data = await getData();
    const next = (await mutator(data)) || data;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(next, null, 2));
    return next;
  });
  return writeChain;
}

export function addManifestEntry(entry) {
  writeChain = writeChain.then(async () => {
    const manifest = await getManifest();
    manifest[entry.id] = entry;
    await saveManifest(manifest);
    return manifest;
  });
  return writeChain;
}

/**
 * Return the public site payload: projects and static collections with each
 * image expanded to include its derivative URLs from the manifest.
 */
export async function getPublicSite() {
  const [data, manifest] = await Promise.all([getData(), getManifest()]);

  const expandImage = (img) => {
    const m = manifest[img.id];
    if (!m) return null;
    return {
      id: img.id,
      caption: img.caption || '',
      thumb: m.thumb,
      full: m.full,
      lqip: m.lqip,
      width: m.width,
      height: m.height,
      aspect: m.aspect,
    };
  };

  const projects = (data.projects || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p) => {
      const images = (p.images || []).map(expandImage).filter(Boolean);
      const cover = p.cover ? expandImage({ id: p.cover }) : null;
      return {
        id: p.id,
        title: p.title,
        caption: p.caption || '',
        link: p.link || '',
        cover: cover || images[0] || null,
        images,
      };
    });

  const mosaic = (data.mosaic || [])
    .map((m) => {
      const img = expandImage({ id: m.id });
      return img ? { ...img, projectId: m.projectId } : null;
    })
    .filter(Boolean);

  return {
    projects,
    mosaic,
    profile: data.profile ? expandImage({ id: data.profile }) : null,
    background: data.background ? expandImage({ id: data.background }) : null,
  };
}
