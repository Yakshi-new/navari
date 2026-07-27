import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage',
    discountValue: 0, minOrderAmount: 0, maxDiscountAmount: 0, expiresAt: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/coupons');
      if (data.success) setCoupons(data.data);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    try {
      const { data } = await API.post('/coupons', form);
      if (data.success) {
        toast.success('Coupon created!');
        setForm({ code: '', description: '', discountType: 'percentage', discountValue: 0, minOrderAmount: 0, maxDiscountAmount: 0, expiresAt: '' });
        fetchCoupons();
      }
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const { data } = await API.delete(`/coupons/${id}`);
      if (data.success) { toast.success('Coupon deleted'); fetchCoupons(); }
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Coupons</div>
          <div className="crm-page-sub">Manage discount codes and promotions</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        {/* List */}
        <div className="crm-card">
          <div className="crm-card-header">
            <span className="crm-card-title">Active Coupons</span>
            <span className="badge-crm success">{coupons.length} active</span>
          </div>
          {loading ? (
            <div className="crm-loading" style={{ minHeight: '200px' }}><div className="crm-spinner"></div></div>
          ) : coupons.length === 0 ? (
            <div className="crm-empty"><i className="bi bi-ticket-perforated"></i><p>No coupons yet.</p></div>
          ) : (
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Expiry</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, background: 'rgba(99,102,241,.08)', color: 'var(--clr-accent)', padding: '3px 8px', borderRadius: '6px' }}>
                          {c.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </td>
                      <td>₹{c.minOrderAmount}</td>
                      <td style={{ color: 'var(--txt-muted)', fontSize: '12.5px' }}>
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'No expiry'}
                      </td>
                      <td>
                        <button className="btn-crm btn-crm-danger btn-crm-sm" onClick={() => handleDelete(c._id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Form */}
        <div className="crm-card" style={{ alignSelf: 'start' }}>
          <div className="crm-card-header"><span className="crm-card-title">Create Coupon</span></div>
          <div className="crm-card-body">
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="crm-label">Coupon Code *</label>
                <input className="crm-input" placeholder="e.g. VASTRA20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }} />
              </div>
              <div className="form-group">
                <label className="crm-label">Description</label>
                <input className="crm-input" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="crm-label">Discount Type</label>
                <select className="crm-select" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Flat (₹)</option>
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="crm-label">Discount Value *</label>
                  <input type="number" className="crm-input" value={form.discountValue || ''} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} required min="0" />
                </div>
                <div className="form-group">
                  <label className="crm-label">Min Order (₹)</label>
                  <input type="number" className="crm-input" value={form.minOrderAmount || ''} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="crm-label">Expiry Date</label>
                <input type="date" className="crm-input" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
              <button type="submit" className="btn-crm btn-crm-primary" style={{ width: '100%' }}>
                <i className="bi bi-plus-lg"></i> Create Coupon
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupons;
