import React, { useState } from 'react';
import SEO from '../components/SEO';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 600);
  };

  return (
    <div>
      <SEO
        title="Track Order"
        description="Track your handloom apparel package delivery status and shipment updates in real-time."
      />
      <div className="policy-page-header text-center">
        <div className="container">
          <span className="badge bg-crimson text-white px-3 py-2 mb-2 rounded-pill fw-semibold">
            HELP & INFO
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">Track Your Order Status</h1>
          <p className="text-muted small mb-0">Enter your Order ID and phone number to get live shipping updates</p>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '700px' }}>
          
          <div className="policy-card mb-4">
            <form onSubmit={handleTrack}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Order ID *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ORD-1092834 or 64f1..."
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Mobile Number / Email</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Associated phone number or email"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-hero-primary w-100 py-3" disabled={loading}>
                {loading ? 'Searching Logistics Database...' : 'Track Package'}
              </button>
            </form>
          </div>

          {searched && (
            <div className="policy-card">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div>
                  <h3 className="h6 fw-bold mb-1 text-dark">Order #{orderId}</h3>
                  <span className="badge bg-success">In Transit — Bluedart Express</span>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block">Expected Delivery</small>
                  <strong className="text-crimson">2 - 3 Days</strong>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="timeline-wrap">
                {[
                  { title: 'Order Confirmed', date: 'Yesterday, 10:30 AM', done: true },
                  { title: 'Quality Checked & Packed in Varanasi', date: 'Yesterday, 04:15 PM', done: true },
                  { title: 'Handed Over to Courier Partner', date: 'Today, 09:00 AM', done: true },
                  { title: 'Out for Delivery', date: 'Pending', done: false },
                  { title: 'Delivered', date: 'Pending', done: false },
                ].map((item, idx) => (
                  <div key={idx} className="d-flex gap-3 mb-3 align-items-start">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                        item.done ? 'bg-crimson text-white' : 'bg-secondary text-white opacity-50'
                      }`}
                      style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                    >
                      {item.done ? <i className="bi bi-check-lg"></i> : idx + 1}
                    </div>
                    <div>
                      <h5 className="h6 fw-bold mb-0 text-dark" style={{ fontSize: '0.92rem' }}>{item.title}</h5>
                      <small className="text-muted">{item.date}</small>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
