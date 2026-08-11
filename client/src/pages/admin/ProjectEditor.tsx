import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type GalleryImage } from '../../lib/api';
import { invalidateSite } from '../../lib/useSite';

export default function ProjectEditor() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [link, setLink] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  const flash = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 2600);
  };

  const load = async () => {
    setLoading(true);
    const [adminList, site] = await Promise.all([api.adminProjects(), api.getSite()]);
    const raw = adminList.find((p) => p.id === id);
    const pub = site.projects.find((p) => p.id === id);
    if (raw) {
      setTitle(raw.title);
      setCaption(raw.caption);
      setLink(raw.link);
      setCover(raw.cover);
    }
    if (pub) setImages(pub.images);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveDetails = async () => {
    setSaving(true);
    try {
      await api.updateProject(id, { title, caption, link, cover: cover ?? '' });
      invalidateSite();
      flash('Saved');
    } catch (e) {
      flash((e as Error).message, true);
    } finally {
      setSaving(false);
    }
  };

  const persistOrder = async (next: GalleryImage[]) => {
    setImages(next);
    try {
      await api.setImages(
        id,
        next.map((i) => i.id)
      );
      invalidateSite();
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  const removeImage = async (imgId: string) => {
    if (!window.confirm('Remove this photo from the project?')) return;
    const next = images.filter((i) => i.id !== imgId);
    await persistOrder(next);
    if (cover === imgId) {
      const newCover = next[0]?.id ?? '';
      setCover(newCover || null);
      await api.updateProject(id, { cover: newCover });
      invalidateSite();
    }
    flash('Photo removed');
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  };

  const makeCover = async (imgId: string) => {
    setCover(imgId);
    await api.updateProject(id, { cover: imgId });
    invalidateSite();
    flash('Cover updated');
  };

  const doUpload = async (files: FileList | File[]) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const res = await api.uploadImages(id, files);
      setImages(res.project.images);
      if (!cover && res.project.cover) setCover(res.project.cover.id);
      invalidateSite();
      flash(`Added ${res.added.length} photo${res.added.length === 1 ? '' : 's'}`);
    } catch (e) {
      flash((e as Error).message, true);
    } finally {
      setUploading(false);
    }
  };

  const deleteProject = async () => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    await api.deleteProject(id);
    invalidateSite();
    navigate('/admin');
  };

  return (
    <div className="admin">
      <div className="admin-topbar">
        <Link to="/admin" className="brand" style={{ fontSize: 20 }}>
          ← Projects
        </Link>
        <div className="admin-actions">
          <Link to={`/projects/${id}`} className="btn btn-ghost btn-sm" target="_blank">
            Preview
          </Link>
          <button className="btn btn-accent btn-sm" onClick={saveDetails} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="admin-body">
        {loading ? (
          <div className="center-screen">
            <div className="loader" />
          </div>
        ) : (
          <div className="editor-grid">
            <div className="card">
              <h2>Details</h2>
              <label className="form-label">Title</label>
              <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />

              <label className="form-label">Caption</label>
              <textarea
                className="field"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{ minHeight: 120 }}
              />

              <label className="form-label">Link (optional)</label>
              <input
                className="field"
                value={link}
                placeholder="https://…"
                onChange={(e) => setLink(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button className="btn btn-sm" onClick={saveDetails} disabled={saving}>
                  {saving ? 'Saving…' : 'Save details'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={deleteProject}>
                  Delete project
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Photos ({images.length})</h2>
              <div className="editor-images">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    className={`editor-tile ${cover === img.id ? 'is-cover' : ''}`}
                  >
                    <img src={`/${img.thumb}`} alt="" loading="lazy" />
                    {cover === img.id && <span className="cover-flag">Cover</span>}
                    <div className="editor-tile__bar">
                      <button
                        className="tile-btn"
                        title="Move left"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                      >
                        ‹
                      </button>
                      <button
                        className="tile-btn"
                        title="Set as cover"
                        onClick={() => makeCover(img.id)}
                      >
                        ★
                      </button>
                      <button
                        className="tile-btn"
                        title="Move right"
                        onClick={() => move(i, 1)}
                        disabled={i === images.length - 1}
                      >
                        ›
                      </button>
                      <button
                        className="tile-btn danger"
                        title="Remove"
                        onClick={() => removeImage(img.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`dropzone ${drag ? 'drag' : ''}`}
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  doUpload(e.dataTransfer.files);
                }}
              >
                {uploading ? 'Compressing & uploading…' : 'Drop photos here or click to upload'}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) doUpload(e.target.files);
                  e.target.value = '';
                }}
              />
              {uploading && (
                <div className="uploading-note">
                  <div className="loader" /> Uploading — each photo is compressed once on the
                  server.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.error ? 'error' : ''}`}>{toast.msg}</div>}
    </div>
  );
}
