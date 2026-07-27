import React, { useState } from 'react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your message has been sent successfully! We will get back to you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div>
      <SEO
        title="Contact Us"
        description="Have questions about custom sizing, bridal orders, or shipping? Contact Navari customer support."
      />
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/" className="text-crimson text-decoration-none">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">Contact</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-5">
            
            {/* Info */}
            <div className="col-lg-5">
              <span className="section-badge">Get In Touch</span>
              <h2 className="fw-bold text-dark mb-4">We'd Love to Hear from You</h2>
              <p className="text-muted mb-4 small">
                Whether you have questions about custom sizing, bridal order consultations, or shipment status, feel free to drop a message.
              </p>

              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="fs-4 text-crimson"><i className="bi bi-geo-alt-fill"></i></div>
                  <div>
                    <h4 className="h6 fw-bold text-dark mb-1">Store Address</h4>
                    <span className="small text-muted">102, Heritage Handloom Plaza, MG Road, Bengaluru, 560001</span>
                  </div>
                </div>
                <div className="d-flex align-items-start gap-3">
                  <div className="fs-4 text-crimson"><i className="bi bi-envelope-fill"></i></div>
                  <div>
                    <h4 className="h6 fw-bold text-dark mb-1">Email Support</h4>
                    <span className="small text-muted">support@navari.com | sales@navari.com</span>
                  </div>
                </div>
                <div className="d-flex align-items-start gap-3">
                  <div className="fs-4 text-crimson"><i className="bi bi-telephone-fill"></i></div>
                  <div>
                    <h4 className="h6 fw-bold text-dark mb-1">Phone Enquiries</h4>
                    <span className="small text-muted">+91 80 4567 8901 / +91 98765 43210</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 p-4 p-md-5 bg-white rounded">
                <h3 className="h5 fw-bold text-dark mb-4 border-bottom pb-2">Send Message</h3>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Your Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Your Email</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted">Subject</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted">Message</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn-hero-primary w-100 py-3 mt-2">
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
