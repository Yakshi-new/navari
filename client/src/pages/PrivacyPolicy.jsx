import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  return (
    <div>
      <SEO
        title="Privacy Policy"
        description="Learn about how Navari collects, protects, and handles your personal information with full transparency and compliance."
      />
      <div className="policy-page-header text-center">
        <div className="container">
          <span className="badge bg-crimson text-white px-3 py-2 mb-2 rounded-pill fw-semibold">
            HELP & INFO
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">Privacy Policy & Data Security</h1>
          <p className="text-muted small mb-0">How Navari collects, protects, and handles your personal information</p>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="policy-card">
            
            <p className="policy-text">
              At <strong>Navari</strong> (operated under Vastra Elegance Handlooms Pvt. Ltd.), we respect your privacy and are committed to protecting all personal information shared with us while browsing or making purchases on our website.
            </p>

            <h2 className="policy-section-title">1. Information We Collect</h2>
            <p className="policy-text">
              We collect information to fulfill your orders and enhance your shopping experience:
            </p>
            <ul className="policy-text">
              <li><strong>Personal Identity Data:</strong> Full name, shipping address, billing address, phone number, and email address provided during checkout or registration.</li>
              <li><strong>Transaction Data:</strong> Payment confirmation identifiers (we do NOT store full credit card numbers or banking passwords on our servers).</li>
              <li><strong>Technical Logs:</strong> IP address, browser type, device information, and browsing preferences collected via secure cookies.</li>
            </ul>

            <h2 className="policy-section-title">2. How We Use Your Data</h2>
            <ul className="policy-text">
              <li>Processing and delivering your orders via authorized logistics partners (Bluedart, Delhivery).</li>
              <li>Sending SMS & WhatsApp delivery notifications and tracking updates.</li>
              <li>Sending promotional newsletters and exclusive discounts (only if opted in; you can unsubscribe anytime).</li>
              <li>Detecting and preventing fraudulent transactions or security vulnerabilities.</li>
            </ul>

            <h2 className="policy-section-title">3. Data Sharing & Third-Party Services</h2>
            <p className="policy-text">
              We never sell, rent, or lease customer contact lists to third-party marketers. We only share essential operational data with vetted service providers bound by strict confidentiality:
            </p>
            <ul className="policy-text">
              <li>Payment Gateways (Razorpay / Cashfree / PayU) for PCI-DSS compliant payment processing.</li>
              <li>Courier partners for package delivery and COD collection.</li>
              <li>Cloud hosting infrastructure meeting ISO 27001 security standards.</li>
            </ul>

            <h2 className="policy-section-title">4. Cookies & Analytics</h2>
            <p className="policy-text">
              We use functional cookies to remember items in your shopping bag, wishlist preferences, and currency settings. You can manage or disable cookie preferences directly through your web browser settings.
            </p>

            <h2 className="policy-section-title">5. Data Protection Officer & Support</h2>
            <p className="policy-text mb-0">
              For any data access, modification, or deletion requests, please email our Privacy Officer at <strong>privacy@vastraelegance.in</strong> or write to our registered office in Varanasi, Uttar Pradesh - 221001.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
