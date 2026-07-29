import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const SpecialOffer = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offerId, setOfferId] = useState(null);

  const [form, setForm] = useState({
    badge: 'Limited Offer',
    title: 'Festival Sparkle Exclusive Sale',
    subtitle: 'Get up to 40% OFF on select Bridal Lehengas & Handloom Silk Sarees.',
    couponCode: 'NAVARI20',
    offerEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    image: '/images/collection.png',
    primaryBtnText: 'Shop the Sale',
    primaryBtnLink: '/shop?sort=sale',
    isActive: true,
  });

  const fetchOffer = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/banners/admin/all');
      if (data.success) {
        const existingOffer = data.data.find((b) => b.type === 'offer');
        if (existingOffer) {
          setOfferId(existingOffer._id);
          setForm({
            badge: existingOffer.badge || 'Limited Offer',
            title: existingOffer.title || '',
            subtitle: existingOffer.subtitle || '',
            couponCode: existingOffer.couponCode || 'NAVARI20',
            offerEndDate: existingOffer.offerEndDate
              ? new Date(existingOffer.offerEndDate).toISOString().slice(0, 16)
              : new Date().toISOString().slice(0, 16),
            image: existingOffer.image || '/images/collection.png',
            primaryBtnText: existingOffer.primaryBtnText || 'Shop the Sale',
            primaryBtnLink: existingOffer.primaryBtnLink || '/shop?sort=sale',
            isActive: existingOffer.isActive !== undefined ? existingOffer.isActive : true,
          });
        }
      }
    } catch {
      toast.error('Failed to load Special Offer configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setSaving(true);
    try {
      const { data } = await API.post('/upload/single?category=banners', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setForm((prev) => ({ ...prev, image: data.url }));
        toast.success('Offer image uploaded successfully!');
      }
    } catch {
      toast.error('Image upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Offer title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type: 'offer',
        ...form,
        offerEndDate: new Date(form.offerEndDate),
      };

      let res;
      if (offerId) {
        res = await API.put(`/banners/${offerId}`, payload);
      } else {
        res = await API.post('/banners', payload);
      }

      if (res.data.success) {
        toast.success('Special Offer settings saved!');
        if (res.data.data?._id) setOfferId(res.data.data._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="crm-loading">
        <div className="crm-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Special Offer & Countdown Banner</div>
          <div className="crm-page-sub">Configure homepage Limited Offer section, countdown timer, and coupon code</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Main Details */}
          <div className="crm-card">
            <div className="crm-card-header">
              <span className="crm-card-title">Offer Details & Content</span>
            </div>
            <div className="crm-card-body">
              <div className="form-group">
                <label className="crm-label">Offer Tag/Badge</label>
                <input
                  className="crm-input"
                  placeholder="e.g. Limited Offer or Flash Sale"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="crm-label">Offer Headline / Title *</label>
                <input
                  className="crm-input"
                  placeholder="e.g. Festival Sparkle Exclusive Sale"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="crm-label">Description / Subtitle</label>
                <textarea
                  className="crm-textarea"
                  rows="3"
                  placeholder="Describe discount percentage or details..."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                ></textarea>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="crm-label">Coupon Code (Display)</label>
                  <input
                    className="crm-input"
                    placeholder="e.g. NAVARI20"
                    value={form.couponCode}
                    onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>

                <div className="form-group">
                  <label className="crm-label">Countdown End Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="crm-input"
                    value={form.offerEndDate}
                    onChange={(e) => setForm({ ...form, offerEndDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="crm-label">Button Text</label>
                  <input
                    className="crm-input"
                    placeholder="e.g. Shop the Sale"
                    value={form.primaryBtnText}
                    onChange={(e) => setForm({ ...form, primaryBtnText: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="crm-label">Button Target Link</label>
                  <input
                    className="crm-input"
                    placeholder="/shop?sort=sale"
                    value={form.primaryBtnLink}
                    onChange={(e) => setForm({ ...form, primaryBtnLink: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Side Media & Save */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="crm-card">
              <div className="crm-card-header">
                <span className="crm-card-title">Offer Banner Image</span>
              </div>
              <div className="crm-card-body">
                <div className="form-group">
                  <label className="crm-label">Upload New Image</label>
                  <input
                    type="file"
                    className="crm-input"
                    style={{ padding: '7px' }}
                    onChange={handleImageUpload}
                  />
                </div>

                {form.image && (
                  <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img
                      src={getImageUrl(form.image)}
                      alt="Offer preview"
                      style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="crm-card">
              <div className="crm-card-header">
                <span className="crm-card-title">Status</span>
              </div>
              <div className="crm-card-body">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--clr-accent)' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>Show Offer Banner on Homepage</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn-crm btn-crm-primary"
              style={{ padding: '14px', fontSize: '14px', fontWeight: 600 }}
              disabled={saving}
            >
              {saving ? 'Saving Changes...' : 'Save Special Offer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SpecialOffer;
