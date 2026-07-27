import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const ReturnPolicy = () => {
  return (
    <div>
      <SEO
        title="Return & Exchange Policy"
        description="Learn about our 7-day hassle-free return and exchange policy for Indian handlooms at Navari."
      />
      <div className="policy-page-header text-center">
        <div className="container">
          <span className="badge bg-crimson text-white px-3 py-2 mb-2 rounded-pill fw-semibold">
            HELP & INFO
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">7-Day Easy Return & Exchange Policy</h1>
          <p className="text-muted small mb-0">Hassle-free returns, exchanges, and instant refunds</p>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="policy-card">
            
            <p className="policy-text">
              We want you to love everything you purchase from <strong>Navari</strong>. If you are not completely satisfied with your item's size, fit, fabric feel, or color, we offer a stress-free <strong>7-Day Return and Exchange Window</strong> from the date of package delivery.
            </p>

            <h2 className="policy-section-title">1. Return Eligibility Criteria</h2>
            <p className="policy-text">
              To be eligible for a full refund or exchange:
            </p>
            <ul className="policy-text">
              <li>The item must be unused, unwashed, unworn, and undamaged.</li>
              <li>All original brand tags, Silk Mark tags, and security seals must remain intact.</li>
              <li>The product must be returned in its original brand box and cotton saree cover.</li>
            </ul>

            <h2 className="policy-section-title">2. Non-Returnable Items</h2>
            <p className="policy-text">
              Due to hygiene and custom tailoring requirements, the following items are non-returnable:
            </p>
            <ul className="policy-text">
              <li>Custom stitched or altered blouses, stitched lehengas, and picot/fall attached sarees.</li>
              <li>Jewelry sets, nose pins, and hair accessories once unsealed.</li>
              <li>Products purchased during Clearance Flash Sales explicitly marked "Final Sale".</li>
            </ul>

            <h2 className="policy-section-title">3. How to Request a Return or Exchange</h2>
            <ol className="policy-text">
              <li>Log in to your account and go to <strong>My Orders</strong> page.</li>
              <li>Select the item you wish to return/exchange and click <strong>Request Return</strong>.</li>
              <li>Select your reason and upload 2 photos of the product condition.</li>
              <li>Our door-to-door reverse pickup agent will collect the parcel within 24-48 hours.</li>
            </ol>

            <h2 className="policy-section-title">4. Refund Processing Timelines</h2>
            <p className="policy-text">
              Once the returned product arrives at our Varanasi quality center and passes inspection:
            </p>
            <ul className="policy-text">
              <li><strong>Prepaid Orders (UPI/Cards/NetBanking):</strong> Refund credited back to your original payment account within 3 to 5 business days.</li>
              <li><strong>COD Orders:</strong> Refund credited directly to your bank account via UPI / NEFT within 2 business days after collecting bank details.</li>
            </ul>

            <h2 className="policy-section-title">5. Defective or Damaged Product Received?</h2>
            <p className="policy-text mb-4">
              If your package arrived damaged in transit or has a manufacturing weave defect, please inform us within 48 hours of delivery at <strong>support@navari.com</strong> with an unboxing video/photo for immediate priority replacement.
            </p>

            <div className="text-center pt-3 border-top">
              <Link to="/contact" className="btn btn-hero-primary px-4">Contact Customer Care</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
