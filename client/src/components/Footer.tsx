import {
  MailIcon,
  PinIcon,
  FacebookIcon,
  LinkedinIcon,
  InstagramIcon,
} from './icons';

const MAP_URL =
  'https://www.google.com/maps/place/Moncton,+NB/@46.1131365,-64.9654078,11z';

export default function Footer() {
  return (
    <>
      <section className="info-section">
        <div className="container info-grid">
          <div className="info-col">
            <h4>Contact Me</h4>
            <div className="info-contact">
              <a href="mailto:ranzfilm18@gmail.com">
                <MailIcon />
                <span>ranzfilm18@gmail.com</span>
              </a>
              <a href={MAP_URL} target="_blank" rel="noreferrer">
                <PinIcon />
                <span>Moncton, NB</span>
              </a>
            </div>
          </div>
          <div className="info-col">
            <h4>Follow Me</h4>
            <div className="social-box">
              <a
                href="https://www.facebook.com/profile.php?id=100093521709010"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/ranz-jaren-tayo-bontogon-37a6ba243/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedinIcon />
              </a>
              <a
                href="https://www.instagram.com/ranz_jaren.exe/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
      </section>
      <footer className="footer-bar">
        <div className="container">
          &copy; {new Date().getFullYear()} All Rights Reserved By Ranz Bontogon
        </div>
      </footer>
    </>
  );
}
