import { useEffect, useState } from 'react';
import { api, type SiteData } from './api';

let cache: SiteData | null = null;

/** Fetch the public site payload once and cache it for the session. */
export function useSite() {
  const [data, setData] = useState<SiteData | null>(cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    api
      .getSite()
      .then((d) => {
        cache = d;
        if (alive) setData(d);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error, loading: !data && !error };
}

/** Clear the cache after admin edits so public pages refetch. */
export function invalidateSite() {
  cache = null;
}
