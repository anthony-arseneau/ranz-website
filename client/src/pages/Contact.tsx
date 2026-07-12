import Header from '../components/Header';
import Footer from '../components/Footer';

const WEB3FORMS_KEY = '4557c5ac-0b5a-45ba-9cba-e8d6fefdce45';

export default function Contact() {
  return (
    <div className="page">
      <Header />
      <main className="page-main">
        <section className="subscribe" style={{ paddingTop: 'calc(var(--nav-h) + 60px)' }}>
          <div className="container">
            <div className="subscribe__box" style={{ maxWidth: 560, textAlign: 'left' }}>
              <h2 style={{ textAlign: 'center' }}>contact form</h2>
              <form action="https://api.web3forms.com/submit" method="POST">
                <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
                <input type="hidden" name="from_name" value="Contact Submission" />
                <input
                  type="hidden"
                  name="redirect"
                  value={`${window.location.origin}/contact-thank-you`}
                />

                <label className="form-label" htmlFor="fname">
                  Full Name
                </label>
                <input className="field" id="fname" type="text" name="name" placeholder="Your Name" required />

                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="field"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Your Email Address"
                  required
                />

                <label className="form-label" htmlFor="country">
                  Country
                </label>
                <select className="field" id="country" name="country" required defaultValue="Canada">
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Other">Other</option>
                </select>

                <label className="form-label" htmlFor="message">
                  Message
                </label>
                <textarea
                  className="field"
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  required
                />

                <button className="btn" type="submit" style={{ width: '100%', marginTop: 6 }}>
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
