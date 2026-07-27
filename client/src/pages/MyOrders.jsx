import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/my-orders');
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
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
        // Update local state
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o)));
      }
    } catch (err) {
      toast.error(err.message || 'Cannot cancel this order');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'placed': return 'bg-info text-dark';
      case 'confirmed': return 'bg-warning text-dark';
      case 'processing': return 'bg-primary';
      case 'shipped': return 'bg-purple text-white';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
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
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="h3 fw-bold text-dark mb-4">My Orders</h1>

        {orders.length === 0 ? (
          <div className="card shadow-sm border-0 p-5 text-center rounded bg-white">
            <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>
            <h3 className="h5 fw-bold text-dark">No Orders Yet</h3>
            <p className="text-muted small mb-4">You have not placed any orders yet.</p>
            <Link to="/shop" className="btn btn-hero-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => (
              <div key={order._id} className="card shadow-sm border-0 rounded overflow-hidden bg-white">
                
                {/* Header */}
                <div className="card-header bg-light d-flex justify-content-between align-items-center p-3 border-0">
                  <div>
                    <span className="small text-muted me-2">Order:</span>
                    <span className="fw-bold text-dark">{order.orderNumber}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(order.orderStatus)} text-capitalize`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Body */}
                <div className="card-body p-3">
                  <div className="d-flex flex-column gap-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center">
                        <span className="small text-dark text-truncate" style={{ maxWidth: '400px' }}>
                          {item.name} ({item.size})
                        </span>
                        <span className="small text-muted">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div>
                      <span className="small text-muted">Total Amount:</span>
                      <span className="fw-bold text-crimson ms-2">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="d-flex gap-2">
                      <Link to={`/order-confirmation/${order._id}`} className="btn btn-sm btn-outline-dark px-3" style={{ borderRadius: '20px' }}>
                        View Details
                      </Link>
                      {['placed', 'confirmed'].includes(order.orderStatus) && (
                        <button
                          className="btn btn-sm btn-outline-danger px-3"
                          style={{ borderRadius: '20px' }}
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
