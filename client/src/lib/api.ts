export interface GalleryImage {
  id: string;
  caption?: string;
  thumb: string;
  full: string;
  lqip: string;
  width: number;
  height: number;
  aspect: number;
}

export interface Project {
  id: string;
  title: string;
  caption: string;
  link: string;
  cover: GalleryImage | null;
  images: GalleryImage[];
}

export interface MosaicImage extends GalleryImage {
  projectId: string;
}

export interface SiteData {
  projects: Project[];
  mosaic: MosaicImage[];
  profile: GalleryImage | null;
  background: GalleryImage | null;
}

export interface AdminProject {
  id: string;
  title: string;
  caption: string;
  link: string;
  cover: string | null;
  order: number;
  images: { id: string }[];
}

async function req<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getSite: () => req<SiteData>('/api/site'),

  // auth
  login: (password: string) =>
    req<{ ok: boolean }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
  logout: () => req<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => req<{ authenticated: boolean }>('/api/auth/me'),

  // admin
  adminProjects: () => req<AdminProject[]>('/api/admin/projects'),
  updateProject: (
    id: string,
    patch: Partial<Pick<AdminProject, 'title' | 'caption' | 'link' | 'cover'>>
  ) =>
    req<AdminProject>(`/api/admin/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }),
  setImages: (id: string, imageIds: string[]) =>
    req<AdminProject>(`/api/admin/projects/${id}/images`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageIds }),
    }),
  uploadImages: (id: string, files: FileList | File[]) => {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('images', f));
    return req<{ added: string[]; project: Project }>(`/api/admin/projects/${id}/images`, {
      method: 'POST',
      body: fd,
    });
  },
  createProject: (title: string) =>
    req<AdminProject>('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }),
  deleteProject: (id: string) =>
    req<{ ok: boolean }>(`/api/admin/projects/${id}`, { method: 'DELETE' }),
};
