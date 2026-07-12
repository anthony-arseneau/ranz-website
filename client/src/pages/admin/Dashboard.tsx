import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type AdminProject, type SiteData } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { invalidateSite } from '../../lib/useSite';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([api.adminProjects(), api.getSite()]);
    setProjects(p);
    setSite(s);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const coverFor = (p: AdminProject) => {
    const pub = site?.projects.find((x) => x.id === p.id);
    return pub?.cover?.thumb;
  };

  const addProject = async () => {
    const title = window.prompt('New project title?');
    if (!title) return;
    const created = await api.createProject(title);
    invalidateSite();
    navigate(`/admin/projects/${created.id}`);
  };

  const removeProject = async (p: AdminProject) => {
    if (!window.confirm(`Delete “${p.title}” and its photo references? This cannot be undone.`))
      return;
    await api.deleteProject(p.id);
    invalidateSite();
    load();
  };

  return (
    <div className="admin">
      <div className="admin-topbar">
        <span className="brand">
          ranz bontogon <small>admin</small>
        </span>
        <div className="admin-actions">
          <Link to="/" className="btn btn-ghost btn-sm" target="_blank">
            View site
          </Link>
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              await logout();
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div className="admin-body">
        <div className="admin-section-title">
          <h1>Projects</h1>
          <button className="btn btn-accent btn-sm" onClick={addProject}>
            + New project
          </button>
        </div>

        {loading ? (
          <div className="center-screen">
            <div className="loader" />
          </div>
        ) : (
          <div className="admin-list">
            {projects
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((p) => {
                const cover = coverFor(p);
                return (
                  <div className="admin-row" key={p.id}>
                    {cover ? (
                      <img className="admin-row__thumb" src={`/${cover}`} alt="" />
                    ) : (
                      <div className="admin-row__thumb" />
                    )}
                    <div className="admin-row__meta">
                      <h3>{p.title}</h3>
                      <span>{p.images.length} photos</span>
                    </div>
                    <Link to={`/admin/projects/${p.id}`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeProject(p)}>
                      Delete
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
