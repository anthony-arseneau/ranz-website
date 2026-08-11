import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  placeholder?: string;
  alt?: string;
  aspect?: number;
  className?: string;
  eager?: boolean;
  sizes?: string;
}

/**
 * Renders a tiny blurred placeholder immediately, then lazily swaps in the
 * real (already-compressed) image once it scrolls near the viewport and
 * finishes decoding. This keeps galleries and previews feeling instant.
 */
export default function ProgressiveImage({
  src,
  placeholder,
  alt = '',
  aspect,
  className = '',
  eager = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (eager || visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, visible]);

  const style = aspect ? { aspectRatio: String(aspect) } : undefined;

  return (
    <div ref={ref} className={`pimg ${loaded ? 'loaded' : ''} ${className}`} style={style}>
      {placeholder && <img className="pimg__ph" src={placeholder} alt="" aria-hidden="true" />}
      {visible && (
        <img
          className={`pimg__img ${loaded ? 'loaded' : ''}`}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
