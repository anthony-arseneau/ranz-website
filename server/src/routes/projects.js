// Public + admin project routes.

import express from 'express';
import multer from 'multer';
import { getPublicSite, updateData, addManifestEntry, getData } from '../db.js';
import { processUpload } from '../images.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 }, // 40MB per image
});

// ---- Public ----------------------------------------------------------------

router.get('/site', async (_req, res) => {
  res.json(await getPublicSite());
});

// ---- Admin -----------------------------------------------------------------

// Raw editable project data (unexpanded) for the dashboard.
router.get('/admin/projects', requireAdmin, async (_req, res) => {
  const data = await getData();
  res.json(data.projects || []);
});

// Update a project's text fields (title, caption, link, cover).
router.patch('/admin/projects/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, caption, link, cover } = req.body || {};
  let updated = null;
  await updateData((data) => {
    const p = data.projects.find((x) => x.id === id);
    if (!p) return data;
    if (typeof title === 'string') p.title = title;
    if (typeof caption === 'string') p.caption = caption;
    if (typeof link === 'string') p.link = link;
    if (typeof cover === 'string') p.cover = cover;
    updated = p;
    return data;
  });
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  res.json(updated);
});

// Reorder / remove images: replace the full ordered image id list.
router.put('/admin/projects/:id/images', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { imageIds } = req.body || {};
  if (!Array.isArray(imageIds)) {
    return res.status(400).json({ error: 'imageIds array required' });
  }
  let updated = null;
  await updateData((data) => {
    const p = data.projects.find((x) => x.id === id);
    if (!p) return data;
    p.images = imageIds.map((imgId) => ({ id: imgId }));
    if (p.cover && !imageIds.includes(p.cover) && imageIds.length) {
      // keep cover valid if it was a gallery image that got removed
    }
    updated = p;
    return data;
  });
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  res.json(updated);
});

// Upload one or more images; compresses each and appends to the project.
router.post(
  '/admin/projects/:id/images',
  requireAdmin,
  upload.array('images', 30),
  async (req, res) => {
    const { id } = req.params;
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No files uploaded' });

    const added = [];
    for (const file of files) {
      try {
        const entry = await processUpload(file.buffer, file.originalname);
        await addManifestEntry(entry);
        added.push(entry.id);
      } catch (err) {
        console.warn(`Upload failed for ${file.originalname}: ${err.message}`);
      }
    }

    let updated = null;
    await updateData((data) => {
      const p = data.projects.find((x) => x.id === id);
      if (!p) return data;
      p.images = [...(p.images || []), ...added.map((imgId) => ({ id: imgId }))];
      if (!p.cover && added.length) p.cover = added[0];
      updated = p;
      return data;
    });
    if (!updated) return res.status(404).json({ error: 'Project not found' });

    const site = await getPublicSite();
    const project = site.projects.find((x) => x.id === id);
    res.json({ added, project });
  }
);

// Create a brand-new project.
router.post('/admin/projects', requireAdmin, async (req, res) => {
  const { title } = req.body || {};
  const slug =
    (title || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `project-${Date.now()}`;
  let created = null;
  await updateData((data) => {
    const id = data.projects.some((p) => p.id === slug) ? `${slug}-${Date.now()}` : slug;
    created = {
      id,
      title: title || 'Untitled',
      caption: '',
      link: '',
      cover: null,
      order: data.projects.length,
      images: [],
    };
    data.projects.push(created);
    return data;
  });
  res.json(created);
});

// Delete a project.
router.delete('/admin/projects/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  await updateData((data) => {
    data.projects = data.projects.filter((p) => p.id !== id);
    return data;
  });
  res.json({ ok: true });
});

export default router;
