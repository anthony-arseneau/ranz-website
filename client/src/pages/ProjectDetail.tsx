import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressiveImage from '../components/ProgressiveImage';
import Lightbox from '../components/Lightbox';
import { useSite } from '../lib/useSite';
import { LinkIcon } from '../components/icons';

export default function ProjectDetail() {
  const { id } = useParams();
  const { data, loading } = useSite();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const project = data?.projects.find((p) => p.id === id);

  if (loading) {
    return (
      <div className="page">
        <Header />
        <main className="page-main center-screen">
          <div className="loader" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <Header />
        <main className="page-main center-screen">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: 16 }}>Project not found</h2>
            <Link to="/projects" className="text-link">
              Back to projects
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <main className="page-main">
        <section className="detail">
          <div className="container">
            <div className="detail__head fade-in">
              <h1>{project.title}</h1>
              <div>
                {project.caption && <p>{project.caption}</p>}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link detail__link"
                  >
                    <LinkIcon /> View the full story
                  </a>
                )}
              </div>
            </div>

            <div className="masonry">
              {project.images.map((img, i) => (
                <div
                  key={img.id}
                  className="masonry__item"
                  onClick={() => setLightbox(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setLightbox(i)}
                >
                  <ProgressiveImage
                    src={`/${img.thumb}`}
                    placeholder={img.lqip}
                    aspect={img.aspect}
                    alt={project.title}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {lightbox !== null && (
        <Lightbox
          images={project.images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      )}
    </div>
  );
}
