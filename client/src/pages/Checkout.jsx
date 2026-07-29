import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { getImageUrl } from '../utils/imageUrl';

/* ─── Order loader step labels ─── */
const LOADER_STEPS = [
  'Verifying your cart items...',
  'Securing your payment details...',
  'Confirming shipping address...',
  'Processing your order...',
  'Almost there – finalising!',
];

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
};

const Checkout = () => {
  const { cartItems, coupon, getSubtotal, getDiscountAmount, getShippingCharge, getTotalAmount, clearCart } =
    useContext(CartContext);
  const { clearWishlist } = useContext(WishlistContext);
  const { user, refreshProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ─── Saved addresses from user profile ─── */
  const savedAddresses = user?.addresses || [];

  /* ─── Which mode: 'select' (pick a saved addr) | 'new' (add new) ─── */
  const [mode, setMode] = useState('select'); // 'select' or 'new'
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [fieldErrors, setFieldErrors] = useState({});

  /* ─── Payment / order state ─── */
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);

  /* ─── Loader overlay state ─── */
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);
  const stepTimerRef = useRef(null);

  /* ─── Redirect if not logged-in or cart empty ─── */
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  /* ─── Initialize address mode based on saved addresses ─── */
  useEffect(() => {
    if (!user) return;
    if (savedAddresses.length > 0) {
      setMode('select');
      // Pre-select the default address (or first one)
      const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddrId(def._id);
    } else {
      // No saved addresses — show the form directly
      setMode('new');
      // Pre-fill name & phone from profile
      setNewForm((prev) => ({
        ...prev,
        fullName: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  /* ─── Cleanup step-timer on unmount ─── */
  useEffect(() => {
    return () => clearInterval(stepTimerRef.current);
  }, []);

  /* ─── Start / stop the animated steps during order loading ─── */
  const startLoaderSteps = () => {
    setLoaderStep(0);
    let step = 0;
    stepTimerRef.current = setInterval(() => {
      step += 1;
      if (step >= LOADER_STEPS.length) {
        clearInterval(stepTimerRef.current);
      } else {
        setLoaderStep(step);
      }
    }, 2000);
  };

  const stopLoaderSteps = () => {
    clearInterval(stepTimerRef.current);
  };

  /* ─── Validation for new address form ─── */
  const required = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];
  const fieldLabels = {
    fullName: 'Full Name',
    phone: 'Phone Number',
    line1: 'Address Line 1',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
  };

  const validateNewForm = () => {
    const errors = {};
    required.forEach((key) => {
      if (!newForm[key] || !newForm[key].trim()) {
        errors[key] = `${fieldLabels[key]} is required`;
      }
    });
    if (newForm.phone && !/^\d{10}$/.test(newForm.phone.trim())) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }
    if (newForm.pincode && !/^\d{6}$/.test(newForm.pincode.trim())) {
      errors.pincode = 'Enter a valid 6-digit pincode';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewFormChange = (key, value) => {
    setNewForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  /* ─── Get the address object to ship to ─── */
  const getShippingAddress = () => {
    if (mode === 'select') {
      const addr = savedAddresses.find((a) => a._id === selectedAddrId);
      if (!addr) return null;
      return {
        fullName: addr.fullName,
        phone: addr.phone,
        line1: addr.line1,
        line2: addr.line2 || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
      };
    }
    return newForm;
  };

  /* ─── Save new address to server (if checkbox ticked) ─── */
  const saveAddressToServer = async () => {
    try {
      setSavingAddr(true);
      const res = await API.post('/auth/addresses', {
        ...newForm,
        label: newAddrLabel,
        isDefault: savedAddresses.length === 0, // first address is always default
      });
      if (res.data.success) {
        await refreshProfile();
        toast.success('Address saved to your account!');
      }
    } catch (err) {
      // Non-blocking — just warn
      toast.error(err.message || 'Could not save address to account');
    } finally {
      setSavingAddr(false);
    }
  };

  /* ─── Set an existing address as default ─── */
  const handleSetDefault = async (addrId, e) => {
    e.stopPropagation();
    try {
      await API.put(`/auth/addresses/${addrId}/default`);
      await refreshProfile();
      toast.success('Default address updated!');
    } catch (err) {
      toast.error(err.message || 'Could not update default address');
    }
  };

  /* ─── Delete a saved address ─── */
  const handleDeleteAddress = async (addrId, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this saved address?')) return;
    try {
      await API.delete(`/auth/addresses/${addrId}`);
      await refreshProfile();
      toast.success('Address removed');
      // If the deleted address was selected, fall back to first remaining
      if (selectedAddrId === addrId) {
        const remaining = savedAddresses.filter((a) => a._id !== addrId);
        if (remaining.length > 0) {
          setSelectedAddrId(remaining[0]._id);
          setMode('select');
        } else {
          setMode('new');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Could not remove address');
    }
  };

  /* ─── Razorpay loader ─── */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ─── Post-order success actions ─── */
  const onOrderSuccess = (orderId) => {
    clearCart();
    if (clearWishlist) clearWishlist();
    stopLoaderSteps();
    setShowLoader(false);
    setSubmitting(false);
    toast.success('🎉 Order placed successfully!', { duration: 4000 });
    navigate('/my-orders');
  };

  /* ─── Place order handler ─── */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate address selection
    const shippingAddress = getShippingAddress();
    if (!shippingAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }

    // If using new form, validate it
    if (mode === 'new' && !validateNewForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    // Save new address to account if requested
    if (mode === 'new' && saveNewAddress) {
      await saveAddressToServer();
    }

    setShowLoader(true);
    setSubmitting(true);
    startLoaderSteps();

    try {
      const { data } = await API.post('/orders', {
        items: cartItems,
        shippingAddress,
        paymentMethod,
        couponCode: coupon ? coupon.code : '',
      });

      if (data.success) {
        if (paymentMethod === 'cod') {
          setTimeout(() => onOrderSuccess(data.data._id), 10000);
        } else if (paymentMethod === 'razorpay') {
          const res = await loadRazorpayScript();
          if (!res) {
            toast.error('Failed to load payment gateway. Please try Cash on Delivery.');
            stopLoaderSteps();
            setShowLoader(false);
            setSubmitting(false);
            return;
          }

          const options = {
            key: data.razorpayKey,
            amount: data.data.totalAmount * 100,
            currency: 'INR',
            name: 'Navari',
            description: "Premium Women's Fashion",
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
                  setTimeout(() => onOrderSuccess(data.data._id), 10000);
                }
              } catch (_err) {
                toast.error('Payment verification failed. Please contact support.');
                stopLoaderSteps();
                setShowLoader(false);
                setSubmitting(false);
              }
            },
            modal: {
              ondismiss: async () => {
                try {
                  await API.post(`/orders/${data.data._id}/payment-failed`);
                } catch (_e) {}
                toast.error('Payment cancelled. Your order has been removed.');
                stopLoaderSteps();
                setShowLoader(false);
                setSubmitting(false);
              },
            },
            prefill: {
              name: shippingAddress.fullName,
              contact: shippingAddress.phone,
              email: user.email,
            },
            theme: { color: '#C41E3A' },
          };

          setShowLoader(false);
          const rzp = new window.Razorpay(options);

          rzp.on('payment.failed', async (response) => {
            try {
              await API.post(`/orders/${data.data._id}/payment-failed`);
            } catch (_e) {}
            toast.error(`Payment failed: ${response.error?.description || 'Please try again.'}`);
            stopLoaderSteps();
            setShowLoader(false);
            setSubmitting(false);
          });

          rzp.open();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
      stopLoaderSteps();
      setShowLoader(false);
      setSubmitting(false);
    }
  };

  /* ─── New address form field renderer ─── */
  const renderField = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="form-label small fw-semibold text-muted">
        {label}
        {required.includes(key) && <span className="text-crimson ms-1">*</span>}
      </label>
      <input
        type={type}
        className={`form-control form-control-sm${fieldErrors[key] ? ' field-error' : ''}`}
        placeholder={placeholder}
        value={newForm[key]}
        onChange={(e) => handleNewFormChange(key, e.target.value)}
      />
      {fieldErrors[key] && <span className="field-error-msg">{fieldErrors[key]}</span>}
    </div>
  );

  return (
    <>
      {/* ═══════════ ORDER LOADER OVERLAY ═══════════ */}
      {showLoader && (
        <div className="order-loader-overlay">
          <div className="order-loader-card">
            <div className="order-loader-spinner" />
            <div className="order-loader-title">Placing Your Order</div>
            <div className="order-loader-sub">Please wait, do not refresh the page…</div>
            <div className="order-loader-progress">
              <div className="order-loader-progress-bar" />
            </div>
            <div className="order-loader-steps">
              {LOADER_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className={`order-loader-step ${
                    idx < loaderStep ? 'done' : idx === loaderStep ? 'active' : ''
                  }`}
                >
                  <span className="order-loader-step-dot" />
                  {idx < loaderStep ? (
                    <span>✓ {step}</span>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ CHECKOUT PAGE ═══════════ */}
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
              <form onSubmit={handlePlaceOrder} noValidate>

                {/* ── Shipping Address ── */}
                <div className="checkout-section">
                  <div className="checkout-step-title">
                    <div className="checkout-step-num">1</div>
                    <span>Delivery Address</span>
                  </div>

                  {/* ── Saved Address Cards ── */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-3">
                      <div
                        className="d-flex flex-column gap-2 mb-3"
                        style={{ maxHeight: savedAddresses.length > 2 ? '340px' : 'none', overflowY: 'auto' }}
                      >
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr._id}
                            onClick={() => { setSelectedAddrId(addr._id); setMode('select'); }}
                            className={`addr-card${selectedAddrId === addr._id && mode === 'select' ? ' addr-card--selected' : ''}`}
                            style={{
                              border: `2px solid ${selectedAddrId === addr._id && mode === 'select' ? '#C41E3A' : '#e5e7eb'}`,
                              borderRadius: '12px',
                              padding: '14px 16px',
                              cursor: 'pointer',
                              background: selectedAddrId === addr._id && mode === 'select' ? '#fff8f9' : '#fff',
                              transition: 'border-color 0.2s, background 0.2s',
                              position: 'relative',
                            }}
                          >
                            <div className="d-flex align-items-start gap-3">
                              {/* Radio dot */}
                              <div
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  border: `2px solid ${selectedAddrId === addr._id && mode === 'select' ? '#C41E3A' : '#d1d5db'}`,
                                  background: selectedAddrId === addr._id && mode === 'select' ? '#C41E3A' : 'transparent',
                                  flexShrink: 0,
                                  marginTop: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {selectedAddrId === addr._id && mode === 'select' && (
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                                )}
                              </div>

                              {/* Address details */}
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span className="fw-bold text-dark small">{addr.fullName}</span>
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      background: '#f3f4f6',
                                      color: '#6b7280',
                                      padding: '1px 8px',
                                      borderRadius: '20px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {addr.label || 'Home'}
                                  </span>
                                  {addr.isDefault && (
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        background: '#fef2f2',
                                        color: '#C41E3A',
                                        padding: '1px 8px',
                                        borderRadius: '20px',
                                        fontWeight: 700,
                                        border: '1px solid #fecaca',
                                      }}
                                    >
                                      ★ Default
                                    </span>
                                  )}
                                </div>
                                <div className="small text-muted" style={{ lineHeight: 1.5 }}>
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} – {addr.pincode}
                                </div>
                                {addr.phone && (
                                  <div className="small text-muted mt-1">
                                    <i className="bi bi-telephone me-1" />{addr.phone}
                                  </div>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="d-flex flex-column gap-1" style={{ flexShrink: 0 }}>
                                {!addr.isDefault && (
                                  <button
                                    type="button"
                                    className="btn btn-sm"
                                    style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', border: '1px solid #d1d5db', color: '#6b7280', whiteSpace: 'nowrap' }}
                                    onClick={(e) => handleSetDefault(addr._id, e)}
                                  >
                                    Set Default
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-sm"
                                  style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', border: '1px solid #fecaca', color: '#C41E3A', whiteSpace: 'nowrap' }}
                                  onClick={(e) => handleDeleteAddress(addr._id, e)}
                                >
                                  <i className="bi bi-trash3 me-1" />Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add new address toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === 'new' ? 'select' : 'new');
                          if (mode !== 'new') {
                            setNewForm({ ...EMPTY_FORM, fullName: user?.name || '', phone: user?.phone || '' });
                            setFieldErrors({});
                          }
                        }}
                        style={{
                          background: 'none',
                          border: `2px dashed ${mode === 'new' ? '#C41E3A' : '#d1d5db'}`,
                          borderRadius: '12px',
                          padding: '12px 16px',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: mode === 'new' ? '#C41E3A' : '#6b7280',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          transition: 'border-color 0.2s, color 0.2s',
                        }}
                      >
                        <i className={`bi ${mode === 'new' ? 'bi-x-circle' : 'bi-plus-circle'} me-2`} />
                        {mode === 'new' ? 'Cancel – Use Saved Address' : '+ Deliver to a Different Address'}
                      </button>
                    </div>
                  )}

                  {/* ── New Address Form ── */}
                  {mode === 'new' && (
                    <div
                      style={{
                        background: '#fafafa',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '18px',
                        marginTop: savedAddresses.length > 0 ? '12px' : '0',
                      }}
                    >
                      {savedAddresses.length === 0 && (
                        <p className="small text-muted mb-3">
                          <i className="bi bi-info-circle me-1" />
                          Enter your delivery address below. You can save it for faster checkout next time.
                        </p>
                      )}

                      <div className="row g-3">
                        <div className="col-md-6">
                          {renderField('fullName', 'Full Name', 'text', 'e.g. Priya Sharma')}
                        </div>
                        <div className="col-md-6">
                          {renderField('phone', 'Phone Number', 'tel', '10-digit mobile number')}
                        </div>
                        <div className="col-12">
                          {renderField('line1', 'Address Line 1', 'text', 'House / Flat / Block No.')}
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold text-muted">
                            Address Line 2 <span className="text-muted">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Street / Landmark"
                            value={newForm.line2}
                            onChange={(e) => handleNewFormChange('line2', e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          {renderField('city', 'City', 'text', 'e.g. Jaipur')}
                        </div>
                        <div className="col-md-4">
                          {renderField('state', 'State', 'text', 'e.g. Rajasthan')}
                        </div>
                        <div className="col-md-4">
                          {renderField('pincode', 'Pincode', 'text', '6-digit pincode')}
                        </div>

                        {/* Save address options */}
                        <div className="col-12">
                          <label className="save-address-row" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={saveNewAddress}
                              onChange={(e) => setSaveNewAddress(e.target.checked)}
                            />
                            <i className="bi bi-bookmark-check-fill text-crimson" />
                            <span className="small fw-semibold">Save this address to my account</span>
                          </label>

                          {saveNewAddress && (
                            <div className="mt-2 ms-4 d-flex gap-2 flex-wrap">
                              {['Home', 'Work', 'Other'].map((lbl) => (
                                <button
                                  key={lbl}
                                  type="button"
                                  onClick={() => setNewAddrLabel(lbl)}
                                  style={{
                                    padding: '3px 14px',
                                    borderRadius: '20px',
                                    border: `1px solid ${newAddrLabel === lbl ? '#C41E3A' : '#d1d5db'}`,
                                    background: newAddrLabel === lbl ? '#fef2f2' : '#fff',
                                    color: newAddrLabel === lbl ? '#C41E3A' : '#6b7280',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                  }}
                                >
                                  {lbl === 'Home' ? '🏠' : lbl === 'Work' ? '💼' : '📍'} {lbl}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Payment Method ── */}
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

                <button
                  type="submit"
                  className="btn-hero-primary w-100 py-3 mb-4"
                  disabled={submitting || savingAddr}
                  id="btn-place-order"
                >
                  {submitting ? (
                    <>
                      <span className="btn-spinner" />
                      Processing Your Order…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill me-2" />
                      Place Order Securely
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ORDER SUMMARY */}
            <div className="col-lg-4">
              <div className="order-summary-box bg-white p-4 border rounded shadow-sm">
                <h3 className="h6 fw-bold mb-4 pb-2 border-bottom">Order Items</h3>

                <div className="d-flex flex-column gap-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={`${item.product}-${item.size}-${item.color}`} className="d-flex align-items-center gap-3">
                      <img
                        src={getImageUrl(item.image)}
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

                {/* Delivery address summary */}
                {mode === 'select' && selectedAddrId && (() => {
                  const addr = savedAddresses.find((a) => a._id === selectedAddrId);
                  if (!addr) return null;
                  return (
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
                      <div className="small fw-bold text-dark mb-1">
                        <i className="bi bi-geo-alt-fill text-crimson me-1" />
                        Delivering to:
                      </div>
                      <div className="small text-muted" style={{ lineHeight: 1.6 }}>
                        <strong>{addr.fullName}</strong><br />
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                        {addr.city}, {addr.state} – {addr.pincode}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
