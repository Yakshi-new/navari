import React from 'react';
import SEO from '../components/SEO';
import { getImageUrl } from '../utils/imageUrl';

const About = () => {
  return (
    <div>
      <SEO
        title="About Us"
        description="Discover our mission to preserve and celebrate India's rich handloom heritage. Ethical, sustainable, and directly from weavers."
      />
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>About Navari</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/" className="text-crimson text-decoration-none">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">About Us</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <span className="section-badge">Our Story</span>
              <h2 className="fw-bold text-dark mb-4">Weaving Indian Heritage with Modern Grace</h2>
              <p className="text-muted" style={{ lineHeight: '1.8' }}>
                Founded with a passion to preserve and celebrate India's rich handloom heritage, Navari brings you authentic sarees, lehengas, and ethnic wear directly from master weavers across Varanasi, Kanchipuram, and Rajasthan.
              </p>
              <p className="text-muted" style={{ lineHeight: '1.8' }}>
                Every single drape from our store tells a story of centuries-old weaving techniques, intricate gold zari motifs, and weeks of dedicated craftsmanship. We believe in ethical sourcing, sustainable livelihood for artisans, and providing our global customers with premium quality fabric.
              </p>
              <div className="row g-4 mt-2">
                <div className="col-6">
                  <div className="p-3 bg-light rounded border-start border-4 border-crimson">
                    <h4 className="fw-bold text-crimson mb-1">500+</h4>
                    <span className="small text-muted">Weaver Families Supported</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded border-start border-4 border-crimson">
                    <h4 className="fw-bold text-crimson mb-1">100%</h4>
                    <span className="small text-muted">Authentic silk fabrics</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img src={getImageUrl('/uploads/sarees/hero-saree.png')} alt="Saree Weaving" className="img-fluid rounded shadow-lg" style={{ maxHeight: '420px', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
