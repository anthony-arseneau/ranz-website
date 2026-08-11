import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressiveImage from '../components/ProgressiveImage';
import { useSite } from '../lib/useSite';
import type { MosaicImage } from '../lib/api';

const WEB3FORMS_KEY = '4557c5ac-0b5a-45ba-9cba-e8d6fefdce45';

function distribute(items: MosaicImage[], cols: number): MosaicImage[][] {
  const out: MosaicImage[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => out[i % cols].push(item));
  return out;
}

export default function Home() {
  const { data } = useSite();
  const columns = distribute(data?.mosaic ?? [], 4);

  return (
    <div className="page">
      <Header overlay />
      <main className="page-main">
        {/* Hero */}
        <section className="hero">
          <div className="hero__bg">
            {data?.background && (
              <ProgressiveImage
                src={`/${data.background.full}`}
                placeholder={data.background.lqip}
                aspect={data.background.aspect}
                eager
              />
            )}
          </div>
          <div className="hero__card fade-in">
            <h1>ranz bontogon</h1>
            <p>Photographer · Artist · Cultural worker</p>
            <Link to="/about" className="btn">
              Enter
            </Link>
          </div>
        </section>

        {/* Mosaic */}
        <section className="mosaic">
          {columns.map((col, ci) => (
            <div className="mosaic__col" key={ci}>
              {col.map((img, i) => (
                <Link
                  key={`${img.id}-${i}`}
                  to={`/projects/${img.projectId}`}
                  className="mosaic__item"
                >
                  <ProgressiveImage
                    src={`/${img.thumb}`}
                    placeholder={img.lqip}
                    aspect={img.aspect}
                    alt="Portrait by Ranz"
                  />
                  <span className="mosaic__cap">View project</span>
                </Link>
              ))}
            </div>
          ))}
        </section>

        {/* Subscribe */}
        <section className="subscribe">
          <div className="container">
            <div className="subscribe__box">
              <h2>Subscribe</h2>
              <form action="https://api.web3forms.com/submit" method="POST">
                <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
                <input type="hidden" name="message" value="New subscription on ranz-bontogon.com!" />
                <input type="hidden" name="from_name" value="New Subscription" />
                <input
                  type="hidden"
                  name="redirect"
                  value={`${window.location.origin}/subscribe-thank-you`}
                />
                <input
                  className="field"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
                <button className="btn" type="submit" style={{ width: '100%' }}>
                  Submit
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
