import React from 'react';
import SEO from '../components/SEO';

const TermsOfService = () => {
  return (
    <div>
      <SEO
        title="Terms of Service"
        description="Review the general terms and conditions governing the use of the Navari website and shopping services."
      />
      <div className="policy-page-header text-center">
        <div className="container">
          <span className="badge bg-crimson text-white px-3 py-2 mb-2 rounded-pill fw-semibold">
            HELP & INFO
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">Terms of Service</h1>
          <p className="text-muted small mb-0">General terms and conditions governing the use of Navari website and services</p>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="policy-card">
            
            <p className="policy-text">
              Welcome to <strong>Navari</strong>. By accessing or purchasing from our website, you agree to be bound by the following terms, conditions, and store policies.
            </p>

            <h2 className="policy-section-title">1. Intellectual Property & Handloom Craft</h2>
            <p className="policy-text">
              All content on this website—including product photographs, embroidery motifs, brand logos, web design layouts, and textual descriptions—is the exclusive intellectual property of Navari. Reproduction or commercial usage without prior written consent is strictly prohibited.
            </p>

            <h2 className="policy-section-title">2. Product Colors & Artisanal Variations</h2>
            <p className="policy-text">
              Since all our sarees, dupattas, and lehengas are handwoven by traditional master weavers in Varanasi and across India:
            </p>
            <ul className="policy-text">
              <li>Slight variations in weave slubs, zari thread alignment, or color shading are characteristic features of authentic handloom textiles and add to their unique value.</li>
              <li>Product colors viewed on digital screens may vary slightly depending on display calibration and photography lighting.</li>
            </ul>

            <h2 className="policy-section-title">3. Pricing & Currency</h2>
            <p className="policy-text">
              All prices listed on the website are in Indian Rupees (INR ₹) and are inclusive of GST (Goods and Services Tax). We reserve the right to revise prices or cancel orders resulting from typographical pricing errors prior to dispatch.
            </p>

            <h2 className="policy-section-title">4. User Account & Conduct</h2>
            <p className="policy-text">
              Users are responsible for maintaining the confidentiality of their login credentials. Fraudulent, abusive, or spam orders are subject to immediate cancellation and IP blacklist.
            </p>

            <h2 className="policy-section-title">5. Governing Law & Jurisdiction</h2>
            <p className="policy-text mb-0">
              These terms shall be governed by and construed in accordance with the laws of India. Any legal disputes or claims arising out of website usage shall fall under the exclusive jurisdiction of the courts in Varanasi, Uttar Pradesh.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
