import React, { useState } from 'react';
import SEO from '../components/SEO';
import API from '../services/api';
import toast from 'react-hot-toast';

/* ── Step definitions ── */
const STEPS = [
  { key: 'placed',           icon: 'bi-bag-check',    label: 'Order Placed' },
  { key: 'confirmed',        icon: 'bi-check-circle', label: 'Confirmed' },
  { key: 'processing',       icon: 'bi-gear',         label: 'Processing' },
  { key: 'shipped',          icon: 'bi-truck',        label: 'Shipped' },
  { key: 'out_for_delivery', icon: 'bi-bicycle',      label: 'Out for Delivery' },
  { key: 'delivered',        icon: 'bi-house-check',  label: 'Delivered' },
];

const STATUS_ORDER = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const STATUS_LABEL = {
  placed:           'Order Placed',
  confirmed:        'Confirmed',
  processing:       'Processing',
  shipped:          'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
  returned:         'Returned',
};

const TrackOrder = () => {
  const [orderNum, setOrderNum] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNum.trim()) {
      toast.error('Please enter an order number');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const params = { q: orderNum.trim().toUpperCase() };
      if (phone.trim()) params.phone = phone.trim();
      const { data } = await API.get('/orders/track', { params });
      if (data.success) {
        setOrder(data.data);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Order not found';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Progress stepper ── */
  const renderStepper = (status) => {
    if (status === 'cancelled' || status === 'returned') {
      return (
        <div className="d-flex align-items-center gap-3 p-3 rounded" style={{ background: '#fff0f0', border: '1.5px solid #f5c6cb' }}>
          <i className="bi bi-x-circle-fill text-danger fs-4" />
          <div>
            <div className="fw-bold text-danger">Order {status === 'cancelled' ? 'Cancelled' : 'Returned'}</div>
            <div className="small text-muted">This order is no longer active.</div>
          </div>
        </div>
      );
    }

    const activeIdx = STATUS_ORDER.indexOf(status);
    const progressPercent = activeIdx < 0 ? 0 : Math.round((activeIdx / (STATUS_ORDER.length - 1)) * 90);

    return (
      <div className="delivery-stepper">
        <div className="delivery-stepper-progress" style={{ width: `${progressPercent}%` }} />
        {STEPS.map((step) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const isDone   = stepIdx < activeIdx;
          const isActive = stepIdx === activeIdx;
          return (
            <div key={step.key} className={`delivery-step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
              <div className="delivery-step-dot">
                {isDone
                  ? <i className="bi bi-check-lg" style={{ fontSize: 11 }} />
                  : <i className={step.icon} style={{ fontSize: 11 }} />}
              </div>
              <div className="delivery-step-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <SEO
        title="Track Your Order"
        description="Track your Navari order status and delivery updates in real-time."
      />

      <div className="policy-page-header text-center">
        <div className="container">
          <span className="badge bg-crimson text-white px-3 py-2 mb-2 rounded-pill fw-semibold">
            DELIVERY TRACKING
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">Track Your Order</h1>
          <p className="text-muted small mb-0">Enter your Order Number to get live delivery updates</p>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '720px' }}>

          {/* ── Search form ── */}
          <div className="order-card mb-4">
            <div className="order-card-body">
              <form onSubmit={handleTrack}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">
                      Order Number <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. VE001001"
                      value={orderNum}
                      onChange={(e) => setOrderNum(e.target.value.toUpperCase())}
                      required
                      id="track-order-number"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">
                      Phone Number <span className="text-muted">(Optional — for security)</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      id="track-phone"
                    />
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-hero-primary w-100 py-3"
                      disabled={loading}
                      id="btn-track-order"
                    >
                      {loading ? (
                        <><span className="btn-spinner" /> Searching…</>
                      ) : (
                        <><i className="bi bi-search me-2" /> Track Package</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* ── Error state ── */}
          {error && !order && (
            <div className="order-card p-4 text-center">
              <i className="bi bi-exclamation-circle text-danger fs-2 mb-2 d-block" />
              <div className="fw-bold text-dark mb-1">Order Not Found</div>
              <div className="small text-muted">{error}</div>
            </div>
          )}

          {/* ── Results ── */}
          {order && (
            <div className="order-card">

              {/* Header */}
              <div className="order-card-header">
                <div>
                  <div className="small text-muted mb-1">Order Number</div>
                  <div className="fw-bold text-dark fs-6">{order.orderNumber}</div>
                </div>
                <div className="text-end">
                  <div className="small text-muted mb-1">Current Status</div>
                  <span
                    className="badge text-capitalize"
                    style={{
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      padding: '5px 12px',
                      background: order.orderStatus === 'delivered' ? '#198754'
                        : order.orderStatus === 'cancelled' ? '#dc3545'
                        : order.orderStatus === 'shipped' ? '#1a1a2e'
                        : '#C41E3A',
                      color: '#fff',
                    }}
                  >
                    {STATUS_LABEL[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Stepper */}
              <div className="order-card-body pb-0">
                {renderStepper(order.orderStatus)}
              </div>

              {/* Tracking + Courier info */}
              {order.trackingNumber && order.orderStatus !== 'cancelled' && (
                <div className="order-card-body pt-2 pb-0">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {order.courierName && (
                      <span className="courier-badge">
                        <i className="bi bi-truck" /> {order.courierName}
                      </span>
                    )}
                    {order.courierTrackingUrl ? (
                      <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer" className="tracking-chip">
                        <i className="bi bi-geo-alt-fill" />
                        AWB: {order.trackingNumber}
                        <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem', opacity: 0.7 }} />
                      </a>
                    ) : (
                      <span className="tracking-chip" style={{ cursor: 'default' }}>
                        <i className="bi bi-truck" /> AWB: {order.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="order-card-body pt-3">
                <div className="small fw-bold text-dark mb-2">Items Ordered</div>
                <div className="d-flex flex-column gap-2 mb-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center small">
                      <span className="text-dark text-truncate" style={{ maxWidth: 340 }}>
                        {item.name} — <span className="text-muted">Size: {item.size || '—'}</span>
                      </span>
                      <span className="text-muted ms-2">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Status History Timeline */}
                {order.statusHistory?.length > 0 && (
                  <>
                    <div className="small fw-bold text-dark mb-2 mt-3">📋 Delivery Timeline</div>
                    <div className="status-timeline">
                      {[...order.statusHistory].reverse().map((h, i) => (
                        <div key={i} className="status-timeline-item">
                          <div className="status-timeline-dot">
                            <i className="bi bi-check-lg" style={{ fontSize: 10 }} />
                          </div>
                          <div className="status-timeline-content">
                            <div className="status-timeline-title">{h.status?.replace(/_/g, ' ')}</div>
                            <div className="status-timeline-time">{new Date(h.updatedAt).toLocaleString('en-IN')}</div>
                            {h.note && <div className="status-timeline-note">"{h.note}"</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="order-card-footer">
                <div className="small text-muted">
                  Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="d-flex gap-2">
                  {order.courierTrackingUrl && (
                    <a
                      href={order.courierTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-hero-primary px-3"
                      style={{ borderRadius: '20px', fontSize: '0.82rem' }}
                    >
                      <i className="bi bi-geo-alt me-1" /> Track via {order.courierName || 'Courier'}
                    </a>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
