import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await API.post('/newsletter/subscribe', { email: email.trim() });
      if (data.success) {
        toast.success(data.message || 'Subscribed successfully!');
        setEmail('');
      } else {
        toast.error(data.message || 'Failed to subscribe');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ── NEWSLETTER SECTION (MATCHING REFERENCE DESIGN) ── */}
      <section className="newsletter-banner">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="newsletter-badge">NEWSLETTER</span>
              <h2 className="newsletter-title">Stay Ahead of Fashion Trends</h2>
              <p className="newsletter-subtitle">
                Subscribe for exclusive offers, new arrivals & styling tips — delivered straight to your inbox.
              </p>
            </div>
            <div className="col-lg-5">
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <div className="newsletter-input-group">
                  <input
                    type="email"
                    placeholder="Enter your email address.."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-newsletter-submit" disabled={submitting}>
                    {submitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                <p className="newsletter-guarantee">
                  <i className="bi bi-lock-fill me-1"></i> No spam, ever. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN FOOTER ── */}
      <footer className="site-footer">
        <div className="container">
          <div className="row gy-4">
            
            {/* BRAND */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-brand">Navari</div>
              <p className="footer-desc">
                Celebrating the beauty of Indian heritage through authentic handwoven textiles. From Varanasi to your doorstep — we bring you artisanal fashion that tells stories.
              </p>
              <div className="footer-social">
                <a href="#" className="social-btn" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                <a href="#" className="social-btn" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" className="social-btn" aria-label="Pinterest"><i className="bi bi-pinterest"></i></a>
                <a href="#" className="social-btn" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
                <a href="#" className="social-btn" aria-label="WhatsApp"><i className="bi bi-whatsapp"></i></a>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="col-lg-2 col-md-6">
              <h5 className="footer-heading">QUICK LINKS</h5>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/shop?sort=new">New Arrivals</Link></li>
                <li><Link to="/shop?sort=popular">Best Sellers</Link></li>
                <li><Link to="/shop?sort=sale">Sale</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>

            {/* CATEGORIES */}
            <div className="col-lg-2 col-md-6">
              <h5 className="footer-heading">CATEGORIES</h5>
              <ul className="footer-links">
                <li><Link to="/shop?category=Sarees">Silk Sarees</Link></li>
                <li><Link to="/shop?category=Sarees">Banarasi Sarees</Link></li>
                <li><Link to="/shop?category=Lehengas">Bridal Lehengas</Link></li>
                <li><Link to="/shop?category=Kurtis%20%26%20Suits">Anarkali Suits</Link></li>
                <li><Link to="/shop?category=Kurtis%20%26%20Suits">Palazzo Sets</Link></li>
                <li><Link to="/shop?category=Accessories">Ethnic Accessories</Link></li>
              </ul>
            </div>

            {/* HELP & INFO */}
            <div className="col-lg-2 col-md-6">
              <h5 className="footer-heading">HELP & INFO</h5>
              <ul className="footer-links">
                <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                <li><Link to="/return-policy">Return Policy</Link></li>
                <li><Link to="/size-guide">Size Guide</Link></li>
                <li><Link to="/track-order">Track My Order</Link></li>
                <li><Link to="/faqs">FAQs</Link></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service">Terms of Service</Link></li>
              </ul>
            </div>

            {/* CONTACT US */}
            <div className="col-lg-3 col-md-6">
              <h5 className="footer-heading">CONTACT US</h5>
              <div className="footer-contact-item">
                <i className="bi bi-geo-alt-fill"></i>
                <span>23, Silk Market Road, Varanasi, UP – 221001</span>
              </div>
              <div className="footer-contact-item">
                <i className="bi bi-telephone-fill"></i>
                <span>+91 98765 43210</span>
              </div>
              <div className="footer-contact-item">
                <i className="bi bi-envelope-fill"></i>
                <span>hello@vastraelegance.in</span>
              </div>
              <div className="footer-contact-item">
                <i className="bi bi-clock-fill"></i>
                <span>Mon-Sat: 9am – 7pm IST</span>
              </div>
            </div>

          </div>

          {/* BOTTOM BAR */}
          <div className="footer-bottom">
            <div className="footer-bottom-text">
              © {new Date().getFullYear()} Navari. All Rights Reserved. Crafted with love in Varanasi.
            </div>
            <div className="payment-icons">
              <span className="pay-icon">UPI</span>
              <span className="pay-icon">CARD</span>
              <span className="pay-icon">NETBANKING</span>
              <span className="pay-icon">COD</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
