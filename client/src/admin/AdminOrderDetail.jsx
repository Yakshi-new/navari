import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status updates
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.data);
        setStatus(data.data.orderStatus);
        setTrackingNumber(data.data.trackingNumber || '');
      }
    } catch (err) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await API.put(`/orders/${id}/status`, {
        orderStatus: status,
        trackingNumber,
        note,
      });
      if (data.success) {
        toast.success('Order status updated successfully');
        setNote('');
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-crimson" role="status"></div>
      </div>
    );
  }

  if (!order) return <p className="text-danger">Order not found.</p>;

  return (
    <div className="row g-4">
      
      {/* ORDER SUMMARY */}
      <div className="col-lg-8">
        <div className="card shadow-sm border-0 p-4 bg-white rounded mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h3 className="h6 fw-bold mb-0">Order: {order.orderNumber}</h3>
            <span className="small text-muted">{new Date(order.createdAt).toLocaleString()}</span>
          </div>

          <div className="d-flex flex-column gap-3 mb-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="d-flex align-items-center gap-3">
                <img
                  src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                  alt={item.name}
                  style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div className="flex-grow-1">
                  <span className="fw-semibold text-dark d-block small">{item.name}</span>
                  <span className="small text-muted">Qty: {item.quantity} | Size: {item.size} | Color: {item.color || 'Default'}</span>
                </div>
                <span className="fw-bold text-dark">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-top pt-3 small text-muted">
            <div className="d-flex justify-content-between mb-1">
              <span>Subtotal:</span>
              <span className="text-dark">₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="d-flex justify-content-between mb-1 text-success">
                <span>Coupon Discount ({order.couponCode}):</span>
                <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-2">
              <span>Shipping Charge:</span>
              <span className="text-dark">₹{order.shippingCharge}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold text-dark fs-6 pt-2 border-top">
              <span>Total Amount:</span>
              <span className="text-crimson">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 p-4 bg-white rounded">
          <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Status History</h3>
          <div className="d-flex flex-column gap-3">
            {order.statusHistory?.map((hist, idx) => (
              <div key={idx} className="d-flex gap-3 align-items-start border-start border-2 border-crimson ps-3 position-relative">
                <div className="position-absolute bg-crimson rounded-circle" style={{ width: '8px', height: '8px', left: '-5px', top: '6px' }}></div>
                <div>
                  <div className="fw-semibold text-dark text-capitalize">{hist.status.replace('_', ' ')}</div>
                  <div className="small text-muted mb-1">{new Date(hist.updatedAt).toLocaleString()}</div>
                  {hist.note && <p className="small text-muted mb-0">"{hist.note}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CUSTOMER INFO & UPDATE STATUS */}
      <div className="col-lg-4">
        
        {/* Customer Details */}
        <div className="card shadow-sm border-0 p-4 bg-white rounded mb-4">
          <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Customer & Shipping</h3>
          <p className="small text-muted mb-2">
            <strong>Customer:</strong> {order.user?.name}<br />
            Email: {order.user?.email}<br />
            Phone: {order.user?.phone}
          </p>
          <hr />
          <h4 className="h6 fw-bold text-dark mb-2">Shipping Address:</h4>
          <p className="small text-muted mb-0">
            <strong>{order.shippingAddress?.fullName}</strong><br />
            {order.shippingAddress?.line1}, {order.shippingAddress?.line2 && `${order.shippingAddress.line2}, `}
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
            Phone: {order.shippingAddress?.phone}
          </p>
        </div>

        {/* Update Status Form */}
        <div className="card shadow-sm border-0 p-4 bg-white rounded">
          <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Fulfillment Control</h3>
          <form onSubmit={handleStatusUpdate}>
            <div className="mb-3">
              <label className="form-label small text-muted">Order Status</label>
              <select
                className="form-select form-select-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label small text-muted">Tracking Number (Optional)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Express-12345"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small text-muted">Status Note / Update Reason</label>
              <textarea
                className="form-control form-control-sm"
                rows="3"
                placeholder="e.g. Dispatched via BlueDart"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-sm btn-hero-primary w-100" disabled={updating}>
              {updating ? 'Updating...' : 'Update status'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default AdminOrderDetail;
