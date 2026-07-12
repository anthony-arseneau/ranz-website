import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ThankYou({ kind }: { kind: 'contact' | 'subscribe' }) {
  return (
    <div className="page">
      <Header />
      <main className="page-main center-screen">
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }} className="fade-in">
          <h1 style={{ fontSize: 44, color: '#fff', marginBottom: 16 }}>thank you</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28 }}>
            {kind === 'contact'
              ? 'Your message has been sent. Ranz will get back to you soon.'
              : "You're subscribed. Thanks for following along."}
          </p>
          <Link to="/" className="btn">
            Back home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
