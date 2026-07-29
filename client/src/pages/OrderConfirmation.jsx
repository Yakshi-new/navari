import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import SEO from '../components/SEO';

const STATUS_BADGE = {
  placed:           { cls: 'bg-info text-dark',    icon: 'bi-bag-check',     label: 'Order Placed' },
  confirmed:        { cls: 'bg-warning text-dark', icon: 'bi-check-circle',  label: 'Confirmed' },
  processing:       { cls: 'bg-primary text-white',icon: 'bi-gear',          label: 'Processing' },
  shipped:          { cls: 'bg-dark text-white',   icon: 'bi-truck',         label: 'Shipped' },
  out_for_delivery: { cls: 'bg-warning text-dark', icon: 'bi-bicycle',       label: 'Out for Delivery' },
  delivered:        { cls: 'bg-success text-white',icon: 'bi-house-check',   label: 'Delivered' },
  cancelled:        { cls: 'bg-danger text-white', icon: 'bi-x-circle',      label: 'Cancelled' },
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        if (data.success) setOrder(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-crimson" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <SEO title="Order Not Found" description="We could not find your order." />
        <h2 className="h4 fw-bold text-dark">Order Not Found</h2>
        <Link to="/" className="btn btn-hero-primary mt-3">Back to Home</Link>
      </div>
    );
  }

  const badge = STATUS_BADGE[order.orderStatus] || { cls: 'bg-secondary text-white', icon: 'bi-box', label: order.orderStatus };
  const hasTracking = order.trackingNumber && order.orderStatus !== 'cancelled';

  return (
    <div className="py-5 bg-light">
      <SEO
        title={`Order ${order.orderNumber} — Navari`}
        description="Your Navari order details and delivery status."
      />
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="order-card">

          {/* ── Success header ── */}
          <div className="order-card-header justify-content-center flex-column text-center py-4 gap-2">
            <div>
              {order.orderStatus === 'cancelled' ? (
                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '3.5rem' }} />
              ) : (
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3.5rem' }} />
              )}
            </div>
            <div>
              <h1 className="h4 fw-bold text-dark mb-1">
                {order.orderStatus === 'cancelled' ? 'Order Cancelled' : 'Thank You for Your Order!'}
              </h1>
              <p className="text-muted small mb-0">
                {order.orderStatus === 'cancelled'
                  ? 'Your order has been cancelled.'
                  : 'Your order has been placed successfully. We\'ll notify you when it ships.'}
              </p>
            </div>
          </div>

          {/* ── Order info ── */}
          <div className="order-card-body">
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="small text-muted">Order Number</div>
                <div className="fw-bold text-dark">{order.orderNumber}</div>
              </div>
              <div className="col-6">
                <div className="small text-muted">Order Status</div>
                <span className={`badge ${badge.cls} text-capitalize mt-1`} style={{ borderRadius: 20, fontSize: '0.75rem' }}>
                  <i className={`${badge.icon} me-1`} />{badge.label}
                </span>
              </div>
              <div className="col-6">
                <div className="small text-muted">Payment Method</div>
                <div className="fw-semibold text-dark text-uppercase">{order.paymentMethod}</div>
              </div>
              <div className="col-6">
                <div className="small text-muted">Amount Paid</div>
                <div className="fw-bold text-crimson">₹{order.totalAmount?.toLocaleString('en-IN')}</div>
              </div>

              {/* Tracking info */}
              {hasTracking && (
                <>
                  <div className="col-12 mt-2">
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
                </>
              )}
            </div>

            {/* Shipping address */}
            <div className="p-3 rounded mb-0" style={{ background: '#FFF5F7', border: '1px solid #F0D9DF' }}>
              <div className="small fw-bold text-dark mb-1">📍 Delivery Address</div>
              <div className="small text-muted" style={{ lineHeight: 1.7 }}>
                <strong>{order.shippingAddress?.fullName}</strong><br />
                {order.shippingAddress?.line1}
                {order.shippingAddress?.line2 && `, ${order.shippingAddress.line2}`},&nbsp;
                {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}<br />
                📞 {order.shippingAddress?.phone}
              </div>
            </div>
          </div>

          {/* ── Footer actions ── */}
          <div className="order-card-footer justify-content-center gap-3">
            <Link to="/my-orders" className="btn btn-outline-dark px-4 py-2" style={{ borderRadius: '30px', fontSize: '0.9rem' }}>
              <i className="bi bi-list-ul me-1" /> View All Orders
            </Link>
            {hasTracking && order.courierTrackingUrl && (
              <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark px-4 py-2" style={{ borderRadius: '30px', fontSize: '0.9rem' }}>
                <i className="bi bi-geo-alt me-1" /> Track Package
              </a>
            )}
            <Link to="/shop" className="btn btn-hero-primary px-4 py-2">
              <i className="bi bi-bag me-1" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
