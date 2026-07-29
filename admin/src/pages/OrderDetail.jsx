import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [courierName, setCourierName] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const COURIERS = [
    'BlueDart', 'Delhivery', 'DTDC', 'Ekart',
    'Ecom Express', 'Xpressbees', 'Shadowfax', 'India Post', 'Other',
  ];

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.data);
        setStatus(data.data.orderStatus);
        setTracking(data.data.trackingNumber || '');
        setCourierName(data.data.courierName || '');
      }
    } catch { toast.error('Failed to load order'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await API.put(`/orders/${id}/status`, {
        orderStatus: status,
        trackingNumber: tracking,
        courierName,
        note,
      });
      if (data.success) {
        toast.success('Order updated successfully!');
        setNote('');
        fetchOrder();
      }
    } catch (err) { toast.error(err.message || 'Update failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="crm-loading"><div className="crm-spinner"></div></div>;
  if (!order) return <div className="crm-empty"><i className="bi bi-inbox"></i><p>Order not found.</p></div>;

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Order #{order.orderNumber}</div>
          <div className="crm-page-sub">Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</div>
        </div>
        <Link to="/orders" className="btn-crm btn-crm-outline">
          <i className="bi bi-arrow-left"></i> Back to Orders
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Order Items */}
          <div className="crm-card">
            <div className="crm-card-header"><span className="crm-card-title">Order Items</span></div>
            <div style={{ padding: '0 0 8px' }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    style={{ width: '52px', height: '68px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '3px' }}>
                      Qty: {item.quantity} &nbsp;|&nbsp; Size: {item.size} &nbsp;|&nbsp; Color: {item.color || 'Default'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Subtotal', value: `₹${order.subtotal?.toLocaleString('en-IN')}` },
                ...(order.discount > 0 ? [{ label: `Coupon (${order.couponCode})`, value: `-₹${order.discount?.toLocaleString('en-IN')}`, color: 'var(--clr-success)' }] : []),
                { label: 'Shipping', value: `₹${order.shippingCharge || 0}` },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: color || 'var(--txt-secondary)' }}>
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', color: 'var(--txt-primary)', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                <span>Total</span>
                <span style={{ color: 'var(--clr-accent)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="crm-card">
            <div className="crm-card-header"><span className="crm-card-title">Status History</span></div>
            <div className="crm-card-body">
              <div className="timeline">
                {order.statusHistory?.map((h, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot"><i className="bi bi-check-lg" style={{ fontSize: '10px' }}></i></div>
                    <div className="timeline-content">
                      <div className="timeline-title">{h.status?.replace(/_/g, ' ')}</div>
                      <div className="timeline-date">{new Date(h.updatedAt).toLocaleString('en-IN')}</div>
                      {h.note && <div className="timeline-note">"{h.note}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Customer Info */}
          <div className="crm-card">
            <div className="crm-card-header"><span className="crm-card-title">Customer & Shipping</span></div>
            <div className="crm-card-body">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{order.user?.name}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--txt-muted)' }}>{order.user?.email}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--txt-muted)' }}>{order.user?.phone}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Shipping Address</div>
                <div style={{ fontSize: '12.5px', color: 'var(--txt-secondary)', lineHeight: '1.7' }}>
                  <strong>{order.shippingAddress?.fullName}</strong><br />
                  {order.shippingAddress?.line1}{order.shippingAddress?.line2 && `, ${order.shippingAddress.line2}`}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}<br />
                  📞 {order.shippingAddress?.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Control */}
          <div className="crm-card">
            <div className="crm-card-header"><span className="crm-card-title">Fulfillment Control</span></div>
            <div className="crm-card-body">

              {/* Current tracking chip */}
              {order.trackingNumber && (
                <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--txt-muted)', marginBottom: '4px' }}>Current Tracking</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {order.courierName && (
                      <span style={{ background: 'var(--clr-accent)', color: '#fff', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
                        {order.courierName}
                      </span>
                    )}
                    {order.courierTrackingUrl ? (
                      <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-accent)', textDecoration: 'none' }}>
                        {order.trackingNumber} ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{order.trackingNumber}</span>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleStatusUpdate}>
                <div className="form-group">
                  <label className="crm-label">Order Status</label>
                  <select className="crm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {['placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'].map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="crm-label">Courier Partner</label>
                  <select className="crm-select" value={courierName} onChange={(e) => setCourierName(e.target.value)}>
                    <option value="">— Select Courier —</option>
                    {COURIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="crm-label">AWB / Tracking Number</label>
                  <input className="crm-input" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. BD-123456789" />
                  {courierName && tracking && courierName !== 'Other' && (
                    <div style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px' }}>
                      ✓ Tracking URL will be auto-generated for {courierName}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="crm-label">Update Note</label>
                  <textarea className="crm-textarea" rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Dispatched via BlueDart" />
                </div>
                <button type="submit" className="btn-crm btn-crm-primary" style={{ width: '100%', padding: '11px' }} disabled={updating}>
                  {updating ? 'Updating...' : 'Update Order Status'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
