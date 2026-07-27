import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        if (data.success) {
          setOrder(data.data);
        }
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
        <h2 className="h4 fw-bold text-dark">Order Not Found</h2>
        <Link to="/" className="btn btn-hero-primary mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="py-5 bg-light">
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="card shadow-sm border-0 p-4 p-md-5 text-center rounded">
          
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4.5rem' }}></i>
          </div>
          
          <h1 className="h3 fw-bold text-dark mb-2">Thank You for Your Order!</h1>
          <p className="text-muted small mb-4">
            Your order has been placed successfully. An email confirmation has been sent to your registered address.
          </p>

          <div className="bg-light p-3 rounded mb-4 text-start">
            <div className="row g-2">
              <div className="col-6 text-muted small">Order Number:</div>
              <div className="col-6 text-dark fw-bold text-end small">{order.orderNumber}</div>
              
              <div className="col-6 text-muted small">Payment Method:</div>
              <div className="col-6 text-dark text-uppercase text-end small">{order.paymentMethod}</div>

              <div className="col-6 text-muted small">Amount Paid:</div>
              <div className="col-6 text-crimson fw-bold text-end small">₹{order.totalAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <h3 className="h6 fw-bold text-dark mb-3 text-start">Delivery Address:</h3>
          <p className="text-muted text-start small mb-4">
            <strong>{order.shippingAddress?.fullName}</strong><br />
            {order.shippingAddress?.line1}, {order.shippingAddress?.line2 && `${order.shippingAddress.line2}, `}
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
            Phone: {order.shippingAddress?.phone}
          </p>

          <div className="d-flex gap-3 justify-content-center">
            <Link to="/orders" className="btn btn-outline-dark px-4 py-2" style={{ borderRadius: '30px', fontSize: '0.9rem' }}>
              Track My Order
            </Link>
            <Link to="/shop" className="btn btn-hero-primary px-4 py-2">
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
