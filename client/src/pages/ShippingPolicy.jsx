import React from 'react';
import SEO from '../components/SEO';

const ShippingPolicy = () => {
  return (
    <div>
      <SEO
        title="Shipping & Delivery Policy"
        description="Standard and express shipping rates, delivery timelines, and international shipping options."
      />
      <div className="policy-page-header text-center">
        <div className="container">
          <span className="badge bg-crimson text-white px-3 py-2 mb-2 rounded-pill fw-semibold">
            HELP & INFO
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">Shipping & Delivery Policy</h1>
          <p className="text-muted small mb-0">Fast, safe & insured delivery across India and worldwide</p>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="policy-card">
            
            <p className="policy-text">
              At <strong>Navari</strong>, we take utmost care in packaging and shipping your handwoven silk sarees, bridal lehengas, and designer ethnic wear. Every parcel is quality checked, sanitized, and sealed in tamper-proof weather-resistant packaging before dispatch.
            </p>

            <h2 className="policy-section-title">1. Shipping Charges & Free Delivery</h2>
            <p className="policy-text">
              We offer <strong>Free Standard Shipping</strong> across India on all prepaid and Cash on Delivery (COD) orders above <strong>₹999</strong>. For orders below ₹999, a nominal flat shipping fee of ₹99 is applied at checkout.
            </p>

            <h2 className="policy-section-title">2. Processing & Dispatch Timelines</h2>
            <ul className="policy-text">
              <li><strong>Ready-to-Ship Items:</strong> Dispatched within 24 to 48 business hours.</li>
              <li><strong>Made-to-Order & Custom Stitched Items:</strong> Dispatched within 5 to 7 working days depending on embroidery work.</li>
              <li><strong>Handloom Artisanal Saris:</strong> Hand-checked from our Varanasi workshop and shipped within 2 working days.</li>
            </ul>

            <h2 className="policy-section-title">3. Estimated Delivery Times</h2>
            <div className="table-responsive my-3">
              <table className="table table-bordered align-middle text-center small">
                <thead className="table-light">
                  <tr>
                    <th>Region / Location</th>
                    <th>Standard Delivery</th>
                    <th>Express Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Metro Cities (Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad)</td>
                    <td>2 - 4 Business Days</td>
                    <td>1 - 2 Business Days</td>
                  </tr>
                  <tr>
                    <td>State Capitals & Tier 2 Cities</td>
                    <td>3 - 5 Business Days</td>
                    <td>2 - 3 Business Days</td>
                  </tr>
                  <tr>
                    <td>Rest of India & Remote Towns</td>
                    <td>5 - 7 Business Days</td>
                    <td>3 - 4 Business Days</td>
                  </tr>
                  <tr>
                    <td>International Delivery (USA, UK, UAE, Canada, Australia)</td>
                    <td>7 - 10 Business Days</td>
                    <td>4 - 6 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="policy-section-title">4. Courier Partners & Tracking</h2>
            <p className="policy-text">
              We partner with India's most reliable express logistics providers, including <strong>Bluedart, Delhivery, DTDC, and FedEx</strong>. As soon as your order is shipped, an automated SMS & Email with a live AWB tracking link is sent to your registered contact details.
            </p>

            <h2 className="policy-section-title">5. Cash on Delivery (COD) Guidelines</h2>
            <p className="policy-text">
              Cash on Delivery is available for order values up to ₹25,000 across 18,000+ pin codes in India. Please ensure your contact phone number is accessible for delivery confirmation by the courier executive.
            </p>

            <h2 className="policy-section-title">6. Need Assistance?</h2>
            <p className="policy-text mb-0">
              For any urgent delivery updates or address changes post-order, please contact our logistics desk at <strong>support@navari.com</strong> or call <strong>+91 98765 43210</strong> (Mon-Sat, 9am - 7pm IST).
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
