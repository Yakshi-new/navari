import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const Checkout = () => {
  const { cartItems, coupon, getSubtotal, getDiscountAmount, getShippingCharge, getTotalAmount, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  // Load default address if available
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setAddress({
        fullName: defaultAddr.fullName || user.name,
        phone: defaultAddr.phone || user.phone || '',
        line1: defaultAddr.line1 || '',
        line2: defaultAddr.line2 || '',
        city: defaultAddr.city || '',
        state: defaultAddr.state || '',
        pincode: defaultAddr.pincode || '',
      });
    } else if (user) {
      setAddress((prev) => ({ ...prev, fullName: user.name, phone: user.phone || '' }));
    }
  }, [user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      toast.error('Please complete all shipping address fields');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await API.post('/orders', {
        items: cartItems,
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon ? coupon.code : '',
      });

      if (data.success) {
        if (paymentMethod === 'cod') {
          clearCart();
          toast.success('Order placed successfully!');
          navigate(`/order-confirmation/${data.data._id}`);
        } else if (paymentMethod === 'razorpay') {
          const res = await loadRazorpayScript();
          if (!res) {
            toast.error('Failed to load payment gateway. Please try Cash on Delivery.');
            setSubmitting(false);
            return;
          }

          const options = {
            key: data.razorpayKey,
            amount: data.data.totalAmount * 100,
            currency: 'INR',
            name: 'Navari',
            description: 'Premium Women\'s Fashion',
            order_id: data.razorpayOrderId,
            handler: async (response) => {
              try {
                const verifyRes = await API.post('/orders/verify-payment', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: data.data._id,
                });
                if (verifyRes.data.success) {
                  clearCart();
                  toast.success('Payment successful! Order placed.');
                  navigate(`/order-confirmation/${data.data._id}`);
                }
              } catch (err) {
                toast.error('Payment verification failed. Please contact support.');
              }
            },
            prefill: {
              name: address.fullName,
              contact: address.phone,
              email: user.email,
            },
            theme: {
              color: '#C41E3A',
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5 bg-light">
      <SEO
        title="Secure Checkout"
        description="Complete your purchase securely at Navari. Enter shipping address and choose payment method."
      />
      <div className="container">
        <h1 className="h3 fw-bold text-dark mb-4">Checkout</h1>
        
        <div className="row g-4">
          
          {/* SHIPPING & PAYMENT FORM */}
          <div className="col-lg-8">
            <form onSubmit={handlePlaceOrder}>
              
              {/* Shipping address */}
              <div className="checkout-section">
                <div className="checkout-step-title">
                  <div className="checkout-step-num">1</div>
                  <span>Shipping Address</span>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Phone Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted">Address Line 1</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={address.line2}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">City</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">State</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Pincode</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <div className="checkout-step-title">
                  <div className="checkout-step-num">2</div>
                  <span>Select Payment Method</span>
                </div>
                <div className="d-flex flex-column gap-3">
                  <div
                    className={`payment-opt-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="form-check-input"
                      checked={paymentMethod === 'cod'}
                      readOnly
                    />
                    <div>
                      <h4 className="h6 fw-bold mb-1">Cash on Delivery (COD)</h4>
                      <span className="small text-muted">Pay in cash when your order is delivered.</span>
                    </div>
                  </div>
                  <div
                    className={`payment-opt-card ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="form-check-input"
                      checked={paymentMethod === 'razorpay'}
                      readOnly
                    />
                    <div>
                      <h4 className="h6 fw-bold mb-1">Razorpay Online Payment</h4>
                      <span className="small text-muted">Pay securely using Cards, UPI, Netbanking, or Wallets.</span>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-hero-primary w-100 py-3 mb-4" disabled={submitting}>
                {submitting ? 'Processing Your Order...' : 'Place Order'}
              </button>

            </form>
          </div>

          {/* SUMMARY REVIEW */}
          <div className="col-lg-4">
            <div className="order-summary-box bg-white p-4 border rounded shadow-sm">
              <h3 className="h6 fw-bold mb-4 pb-2 border-bottom">Order Items</h3>
              
              <div className="d-flex flex-column gap-3 mb-4">
                {cartItems.map((item) => (
                  <div key={`${item.product}-${item.size}-${item.color}`} className="d-flex align-items-center gap-3">
                    <img
                      src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                      alt={item.name}
                      style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div className="flex-grow-1">
                      <span className="small fw-semibold text-dark text-truncate d-block" style={{ maxWidth: '180px' }}>
                        {item.name}
                      </span>
                      <span className="small text-muted">Qty: {item.quantity} | Size: {item.size}</span>
                    </div>
                    <span className="fw-semibold text-dark small">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Subtotal</span>
                <span>₹{getSubtotal().toLocaleString('en-IN')}</span>
              </div>

              {coupon && (
                <div className="d-flex justify-content-between mb-2 small text-success">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>-₹{getDiscountAmount().toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-3 small text-muted">
                <span>Shipping Charge</span>
                <span>{getShippingCharge() > 0 ? `₹${getShippingCharge()}` : 'FREE'}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <span className="fw-bold text-dark">Total Amount</span>
                <span className="fw-bold text-crimson fs-5">₹{getTotalAmount().toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
