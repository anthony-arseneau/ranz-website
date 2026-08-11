import { useEffect, useState } from 'react';

/** Number of gallery columns for the current viewport (matches the old
 *  masonry breakpoints: 3 wide, 2 tablet, 1 phone). */
export function useColumns(): number {
  const get = () => {
    if (typeof window === 'undefined') return 3;
    const w = window.innerWidth;
    if (w <= 560) return 1;
    if (w <= 900) return 2;
    return 3;
  };
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const onResize = () => setCols(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return cols;
}
