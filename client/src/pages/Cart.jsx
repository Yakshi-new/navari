import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const Cart = () => {
  const {
    cartItems,
    coupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getShippingCharge,
    getTotalAmount,
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState(coupon ? coupon.code : '');
  const [couponLoading, setCouponLoading] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      toast.error('Please login to proceed to checkout');
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <SEO title="Shopping Bag" description="Your shopping bag is empty." />
        <div className="py-5">
          <i className="bi bi-bag-x fs-1 text-crimson mb-3 d-block"></i>
          <h2 className="h4 fw-bold text-dark mb-2">Your Shopping Bag is Empty</h2>
          <p className="text-muted mb-4 small">Add some beautiful handloom products to your bag to see them here.</p>
          <Link to="/shop" className="btn btn-hero-primary">Shop All Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-light">
      <SEO title="Shopping Bag" description="View the items in your shopping bag and proceed to checkout." />
      <div className="container">
        <h1 className="h3 fw-bold text-dark mb-4">Your Shopping Bag</h1>
        
        <div className="row g-4">
          
          {/* CART ITEMS TABLE */}
          <div className="col-lg-8">
            <div className="table-responsive rounded border bg-white shadow-sm mb-4">
              <table className="table cart-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={`${item.product}-${item.size}-${item.color}`}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img src={getImageUrl(item.image)} alt={item.name} className="cart-item-img" />
                          <div>
                            <Link to={`/product/${item.product}`} className="cart-item-name text-decoration-none text-dark d-block">
                              {item.name}
                            </Link>
                            <span className="text-muted small">Size: {item.size} {item.color && `| Color: ${item.color}`}</span>
                          </div>
                        </div>
                      </td>
                      <td>₹{item.price.toLocaleString('en-IN')}</td>
                      <td>
                        <div className="qty-control">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input type="text" value={item.quantity} readOnly />
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="fw-bold text-dark">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-link text-danger p-0 border-0"
                          onClick={() => removeFromCart(item.product, item.size, item.color)}
                        >
                          <i className="bi bi-trash fs-5"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* COUPON BOX */}
            <div className="p-4 bg-white border rounded shadow-sm">
              <h4 className="h6 fw-bold mb-3">Apply Coupon Code</h4>
              {coupon ? (
                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                  <div>
                    <span className="badge bg-success me-2">{coupon.code}</span>
                    <span className="small text-muted">{coupon.description}</span>
                  </div>
                  <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" onClick={removeCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Enter Coupon Code (e.g. VASTRA20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button type="submit" className="btn btn-sm btn-hero-primary px-4 py-2 text-nowrap" disabled={couponLoading}>
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* ORDER SUMMARY */}
          <div className="col-lg-4">
            <div className="order-summary bg-white p-4 rounded border shadow-sm">
              <h3 className="h5 fw-bold text-dark mb-4 pb-2 border-bottom">Order Summary</h3>
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>₹{getSubtotal().toLocaleString('en-IN')}</span>
              </div>
              
              {coupon && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>-₹{getDiscountAmount().toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping Charge</span>
                <span>{getShippingCharge() > 0 ? `₹${getShippingCharge()}` : 'FREE'}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold text-dark fs-5">Total Amount</span>
                <span className="fw-bold text-crimson fs-5">₹{getTotalAmount().toLocaleString('en-IN')}</span>
              </div>

              <button className="btn-hero-primary w-100 py-3" onClick={handleCheckoutRedirect}>
                Proceed to Checkout
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
