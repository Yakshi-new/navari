import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    expiresAt: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/coupons');
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;

    try {
      const { data } = await API.post('/coupons', newCoupon);
      if (data.success) {
        toast.success('Coupon created successfully!');
        setNewCoupon({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: 0,
          minOrderAmount: 0,
          maxDiscountAmount: 0,
          expiresAt: '',
        });
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const { data } = await API.delete(`/coupons/${id}`);
      if (data.success) {
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="row g-4">
      
      {/* COUPON LIST */}
      <div className="col-md-8">
        <div className="card shadow-sm border-0 p-4 bg-white rounded">
          <h3 className="h6 fw-bold mb-4">Active Coupons</h3>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-crimson"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-muted text-uppercase">
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id} style={{ fontSize: '0.88rem' }}>
                      <td className="fw-bold text-dark">{c.code}</td>
                      <td>
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </td>
                      <td>₹{c.minOrderAmount}</td>
                      <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE FORM */}
      <div className="col-md-4">
        <div className="card shadow-sm border-0 p-4 bg-white rounded">
          <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Create Coupon</h3>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label small text-muted">Code</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. WELCOME100"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Description</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Discount Type</label>
              <select
                className="form-select form-select-sm"
                value={newCoupon.discountType}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat Amount (₹)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Discount Value</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={newCoupon.discountValue || ''}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Min Order Amount (₹)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={newCoupon.minOrderAmount || ''}
                onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Expiry Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={newCoupon.expiresAt}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-sm btn-hero-primary w-100">
              Create Coupon
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AdminCoupons;
