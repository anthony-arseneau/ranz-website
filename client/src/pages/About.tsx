import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressiveImage from '../components/ProgressiveImage';
import { useSite } from '../lib/useSite';

export default function About() {
  const { data } = useSite();

  return (
    <div className="page">
      <Header />
      <main className="page-main">
        <section className="about">
          <div className="container about__grid fade-in">
            <div className="about__photo">
              {data?.profile && (
                <ProgressiveImage
                  src={`/${data.profile.full}`}
                  placeholder={data.profile.lqip}
                  aspect={data.profile.aspect}
                  alt="Ranz Bontogon"
                  eager
                />
              )}
            </div>
            <div>
              <h2>artist bio</h2>
              <p>
                <span className="tab">Ranz</span> Bontogon is a photographer, artist, and cultural
                worker based in Moncton, New Brunswick. Originally from Taguig City, Philippines, he
                immigrated to Canada in 2013 and has been living in New Brunswick for over a decade.
                His work explores Filipino identity, migration, and his culture through traditional
                darkroom processes, including silver gelatin and platinum-palladium printing.
              </p>
              <p>
                <span className="tab">Ranz</span> has exhibited his work in solo exhibitions,
                including Strangers At Home at Struts Gallery, and 45.60031 N, 64.95127 W at Fundy
                National Park. His photobook Sa Pilipinas/In the Philippines was well regarded within
                the Filipino community in New Brunswick for its representation of Filipino culture.
                His work has also been recognized in media outlets such as CBC East Coast and
                ABS-CBN News.
              </p>
              <p>
                <span className="tab">He</span> is the recipient of the Marjorie Young Bell Fine Arts
                &amp; Music Award and the Dr. J.E.A. Crake Performance Award in Fine Arts. He has also
                received funding and support from ArtsNB and the Filipino Association of New
                Brunswick.
              </p>
              <p>
                <span className="tab">Ranz</span> completed his Bachelor of Fine Arts with a Minor in
                Art History and an Undergraduate Certificate in Visual Literacy and Culture from Mount
                Allison University. He currently resides in Moncton, where he continues to develop his
                practice and engage with the Filipino community through artist talks and cultural
                initiatives.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
