import React, { useState } from 'react';
import SEO from '../components/SEO';

const faqCategories = [
  {
    category: 'Orders & Payments',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major Indian payment options including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking across 50+ banks, and Cash on Delivery (COD).',
      },
      {
        q: 'Is Cash on Delivery available for my pin code?',
        a: 'COD is available for over 18,000 pin codes across India for order values up to ₹25,000. You can verify availability by entering your pincode at checkout.',
      },
      {
        q: 'Can I cancel or modify my order after placing it?',
        a: 'Orders can be canceled or modified within 4 hours of placing them by contacting our customer care line (+91 98765 43210). Once shipped, orders follow our standard return policy.',
      },
    ],
  },
  {
    category: 'Product Authenticity & Craftsmanship',
    questions: [
      {
        q: 'Are your sarees authentic Silk Mark certified?',
        a: 'Yes! Every silk saree from Navari comes tagged with an official Silk Mark Organization of India (SMOI) certificate guaranteeing 100% pure mulberry, Banarasi, or Kanjivaram silk.',
      },
      {
        q: 'Do sarees come with attached blouse pieces?',
        a: 'Yes, all our sarees include an unstitched 80cm matching running blouse piece attached at the end of the saree drape.',
      },
      {
        q: 'How do I care for my handwoven silk sarees?',
        a: 'We strongly recommend dry cleaning only for all pure silk, brocade, and heavy zari garments. Store them in breathable cotton saree covers away from direct moisture.',
      },
    ],
  },
  {
    category: 'Shipping & International Delivery',
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Standard domestic delivery takes 2–4 business days for metros and 4–7 business days for rest of India. Express shipping is available for urgent requirements.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes! We ship worldwide to over 40+ countries including the USA, UK, UAE, Canada, Australia, and Singapore via Express DHL / FedEx international shipping.',
      },
    ],
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState('0-0');

  const toggle = (idxKey) => {
    setOpenIndex(openIndex === idxKey ? null : idxKey);
  };

  return (
    <div>
      <SEO
        title="Frequently Asked Questions (FAQs)"
        description="Find answers to common questions about shipping, returns, fabric quality, custom stitching, and order status at Navari."
      />
      <div className="policy-page-header text-center">
        <div className="container">
          <span className="badge bg-crimson text-white px-3 py-2 mb-2 rounded-pill fw-semibold">
            HELP & INFO
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">Frequently Asked Questions (FAQs)</h1>
          <p className="text-muted small mb-0">Everything you need to know about shopping with Navari</p>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '860px' }}>
          {faqCategories.map((cat, catIdx) => (
            <div key={catIdx} className="mb-5">
              <h2 className="h5 fw-bold text-dark mb-3 border-bottom pb-2 text-crimson">
                {cat.category}
              </h2>
              <div className="d-flex flex-column gap-3">
                {cat.questions.map((item, qIdx) => {
                  const key = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={qIdx} className="policy-card p-4" style={{ cursor: 'pointer' }} onClick={() => toggle(key)}>
                      <div className="d-flex justify-content-between align-items-center">
                        <h3 className="h6 fw-bold text-dark mb-0">{item.q}</h3>
                        <i className={`bi ${isOpen ? 'bi-chevron-up text-crimson' : 'bi-chevron-down text-muted'}`}></i>
                      </div>
                      {isOpen && (
                        <p className="policy-text mt-3 mb-0 pt-3 border-top text-muted" style={{ fontSize: '0.9rem' }}>
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;
