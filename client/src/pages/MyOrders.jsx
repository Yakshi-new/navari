import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { getImageUrl } from '../utils/imageUrl';

/* ── Delivery step definitions ── */
const STEPS = [
  { key: 'placed',           icon: 'bi-bag-check',       label: 'Order Placed' },
  { key: 'confirmed',        icon: 'bi-check-circle',    label: 'Confirmed' },
  { key: 'processing',       icon: 'bi-gear',            label: 'Processing' },
  { key: 'shipped',          icon: 'bi-truck',           label: 'Shipped' },
  { key: 'out_for_delivery', icon: 'bi-bicycle',         label: 'Out for Delivery' },
  { key: 'delivered',        icon: 'bi-house-check',     label: 'Delivered' },
];

const STATUS_ORDER = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const STATUS_BADGE = {
  payment_pending: { cls: 'bg-warning text-dark',   label: 'Awaiting Payment' },
  placed:           { cls: 'bg-info text-dark',    label: 'Placed' },
  confirmed:        { cls: 'bg-warning text-dark', label: 'Confirmed' },
  processing:       { cls: 'bg-primary text-white',label: 'Processing' },
  shipped:          { cls: 'bg-dark text-white',   label: 'Shipped' },
  out_for_delivery: { cls: 'bg-warning text-dark', label: 'Out for Delivery' },
  delivered:        { cls: 'bg-success text-white',label: 'Delivered' },
  cancelled:        { cls: 'bg-danger text-white', label: 'Cancelled' },
  returned:         { cls: 'bg-secondary text-white',label: 'Returned' },
};

/* ── Delivery progress stepper component ── */
const DeliveryStepper = ({ status }) => {
  if (status === 'cancelled' || status === 'returned') {
    return (
      <div className="d-flex align-items-center gap-2 py-2">
        <span className="delivery-step-dot cancelled" style={{ width: 28, height: 28, borderRadius: '50%', background: '#dc3545', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
          <i className="bi bi-x-lg" />
        </span>
        <span className="small fw-semibold text-danger text-capitalize">{status} — No further delivery updates</span>
      </div>
    );
  }

  const activeIdx = STATUS_ORDER.indexOf(status);
  const progressPercent = activeIdx < 0 ? 0 : Math.round((activeIdx / (STATUS_ORDER.length - 1)) * 90);

  return (
    <div className="delivery-stepper">
      <div className="delivery-stepper-progress" style={{ width: `${progressPercent}%` }} />
      {STEPS.map((step, idx) => {
        const stepIdx = STATUS_ORDER.indexOf(step.key);
        const isDone   = stepIdx < activeIdx;
        const isActive = stepIdx === activeIdx;
        return (
          <div key={step.key} className={`delivery-step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
            <div className="delivery-step-dot">
              {isDone ? <i className="bi bi-check-lg" style={{ fontSize: 11 }} /> : <i className={`${step.icon}`} style={{ fontSize: 11 }} />}
            </div>
            <div className="delivery-step-label">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Main component ── */
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [searchParams] = useSearchParams();

  /* Show toast on Razorpay/PayU redirect result */
  useEffect(() => {
    if (searchParams.get('payu') === 'success') {
      toast.success('🎉 Payment successful! Order placed.');
    } else if (searchParams.get('payu') === 'failed') {
      toast.error('Payment failed. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/my-orders');
        if (data.success) {
          // Client-side safety net: hide ghost/payment-failed orders
          const visible = data.data.filter(
            (o) =>
              o.orderStatus !== 'payment_pending' &&
              !(o.orderStatus === 'cancelled' && o.paymentStatus === 'failed')
          );
          setOrders(visible);
        }
      } catch (_) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await API.put(`/orders/${orderId}/cancel`, { reason: 'Cancelled by customer' });
      if (data.success) {
        toast.success('Order cancelled successfully');
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o)));
      }
    } catch (err) {
      toast.error(err.message || 'Cannot cancel this order');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-crimson" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-light">
      <SEO title="My Orders" description="View and track all your Navari orders with live delivery status." />
      <div className="container" style={{ maxWidth: '860px' }}>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 fw-bold text-dark mb-0">My Orders</h1>
          <Link to="/track-order" className="btn btn-sm btn-outline-dark px-3" style={{ borderRadius: '20px', fontSize: '0.85rem' }}>
            <i className="bi bi-search me-1" /> Track by Order #
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="order-card p-5 text-center">
            <i className="bi bi-box-seam fs-1 text-muted mb-3 d-block" />
            <h3 className="h5 fw-bold text-dark">No Orders Yet</h3>
            <p className="text-muted small mb-4">You have not placed any orders yet.</p>
            <Link to="/shop" className="btn btn-hero-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {orders.map((order) => {
              const badge = STATUS_BADGE[order.orderStatus] || { cls: 'bg-secondary text-white', label: order.orderStatus };
              const isExpanded = expanded === order._id;
              const canCancel = ['placed', 'confirmed'].includes(order.orderStatus);
              const hasTracking = order.trackingNumber && order.orderStatus !== 'cancelled';

              return (
                <div key={order._id} className="order-card">

                  {/* ── Header ── */}
                  <div className="order-card-header">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div>
                        <span className="small text-muted">Order #</span>
                        <span className="fw-bold text-dark ms-1">{order.orderNumber}</span>
                      </div>
                      <span className={`badge ${badge.cls} text-capitalize`} style={{ borderRadius: '20px', fontSize: '0.75rem' }}>
                        {badge.label}
                      </span>
                      {order.courierName && (
                        <span className="courier-badge">
                          <i className="bi bi-truck" /> {order.courierName}
                        </span>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-muted d-none d-sm-block">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <button
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={() => setExpanded(isExpanded ? null : order._id)}
                        aria-label="Toggle details"
                      >
                        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} fs-5`} />
                      </button>
                    </div>
                  </div>

                  {/* ── Delivery Stepper ── */}
                  <div className="order-card-body pb-0">
                    <DeliveryStepper status={order.orderStatus} />
                  </div>

                  {/* ── Items (collapsed preview) ── */}
                  <div className="order-card-body pt-2">
                    <div className="d-flex flex-column gap-2">
                      {(isExpanded ? order.items : order.items.slice(0, 2)).map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-3">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            style={{ width: 44, height: 54, objectFit: 'cover', borderRadius: 8, border: '1px solid #F0D9DF' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="flex-grow-1">
                            <div className="small fw-semibold text-dark text-truncate" style={{ maxWidth: 340 }}>{item.name}</div>
                            <div className="small text-muted">Qty: {item.quantity} | Size: {item.size || '—'}</div>
                          </div>
                          <div className="small fw-semibold text-dark">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                      {!isExpanded && order.items.length > 2 && (
                        <button className="btn btn-link btn-sm text-muted p-0 text-start" onClick={() => setExpanded(order._id)}>
                          + {order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>

                    {/* Expanded: Status History */}
                    {isExpanded && order.statusHistory?.length > 0 && (
                      <div className="mt-3 pt-3 border-top">
                        <div className="small fw-bold text-dark mb-2">📋 Status History</div>
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
                      </div>
                    )}
                  </div>

                  {/* ── Footer ── */}
                  <div className="order-card-footer">
                    {/* Total + tracking */}
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div>
                        <span className="small text-muted">Total: </span>
                        <span className="fw-bold text-crimson">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      {hasTracking && (
                        order.courierTrackingUrl ? (
                          <a
                            href={order.courierTrackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tracking-chip"
                          >
                            <i className="bi bi-geo-alt-fill" />
                            {order.trackingNumber}
                            <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem', opacity: 0.7 }} />
                          </a>
                        ) : (
                          <span className="tracking-chip" style={{ cursor: 'default' }}>
                            <i className="bi bi-truck" /> {order.trackingNumber}
                          </span>
                        )
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex gap-2 flex-wrap">
                      <Link
                        to={`/order-confirmation/${order._id}`}
                        className="btn btn-sm btn-outline-dark px-3"
                        style={{ borderRadius: '20px', fontSize: '0.82rem' }}
                      >
                        <i className="bi bi-receipt me-1" /> Details
                      </Link>

                      {hasTracking && order.courierTrackingUrl && (
                        <a
                          href={order.courierTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-dark px-3"
                          style={{ borderRadius: '20px', fontSize: '0.82rem' }}
                        >
                          <i className="bi bi-geo-alt me-1" /> Track Package
                        </a>
                      )}

                      {canCancel && (
                        <button
                          className="btn btn-sm btn-outline-danger px-3"
                          style={{ borderRadius: '20px', fontSize: '0.82rem' }}
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          <i className="bi bi-x-circle me-1" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
