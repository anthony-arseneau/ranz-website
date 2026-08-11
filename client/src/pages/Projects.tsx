import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressiveImage from '../components/ProgressiveImage';
import { useSite } from '../lib/useSite';

export default function Projects() {
  const { data, loading } = useSite();

  return (
    <div className="page">
      <Header />
      <main className="page-main">
        <section className="projects">
          <div className="container">
            <div className="projects__head fade-in">
              <h1>projects</h1>
              <p>A selection of photographic bodies of work.</p>
            </div>

            {loading && (
              <div className="center-screen">
                <div className="loader" />
              </div>
            )}

            <div className="projects__grid">
              {data?.projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
                  {p.cover && (
                    <ProgressiveImage
                      src={`/${p.cover.thumb}`}
                      placeholder={p.cover.lqip}
                      alt={p.title}
                    />
                  )}
                  <div className="project-card__label">
                    <h3>{p.title}</h3>
                    <span>{p.images.length} photos</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
