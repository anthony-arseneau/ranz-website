import { useCallback, useEffect, useState } from 'react';
import type { GalleryImage } from '../lib/api';

interface Props {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Full-screen viewer. The full-resolution image is fetched only when a photo
 * is opened; the blurred placeholder shows instantly while it decodes, and the
 * neighbouring full images are prefetched for snappy arrow navigation.
 */
export default function Lightbox({ images, index, onClose, onNavigate }: Props) {
  const [loaded, setLoaded] = useState(false);
  const image = images[index];

  const go = useCallback(
    (dir: number) => {
      const next = (index + dir + images.length) % images.length;
      setLoaded(false);
      onNavigate(next);
    },
    [index, images.length, onNavigate]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [go, onClose]);

  // Prefetch neighbours' full images.
  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      const n = images[(i + images.length) % images.length];
      if (n) {
        const img = new Image();
        img.src = `/${n.full}`;
      }
    });
  }, [index, images]);

  if (!image) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__btn lightbox__close" aria-label="Close" onClick={onClose}>
        ✕
      </button>
      {images.length > 1 && (
        <button
          className="lightbox__btn lightbox__prev"
          aria-label="Previous"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
        >
          ‹
        </button>
      )}
      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        {!loaded && (
          <>
            <img
              src={image.lqip}
              alt=""
              aria-hidden="true"
              className="lightbox__img loaded"
              style={{ filter: 'blur(16px)', position: 'absolute', maxHeight: '88vh' }}
            />
            <div className="lightbox__spin" />
          </>
        )}
        <img
          key={image.id}
          className={`lightbox__img ${loaded ? 'loaded' : ''}`}
          src={`/${image.full}`}
          alt={image.caption || ''}
          onLoad={() => setLoaded(true)}
        />
      </div>
      {images.length > 1 && (
        <button
          className="lightbox__btn lightbox__next"
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
        >
          ›
        </button>
      )}
      {images.length > 1 && (
        <div className="lightbox__count">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
