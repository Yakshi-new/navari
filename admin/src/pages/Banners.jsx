import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcementsText, setAnnouncementsText] = useState('');
  const [announcementBannerId, setAnnouncementBannerId] = useState(null);
  const [editSlide, setEditSlide] = useState(null);
  const [newSlide, setNewSlide] = useState({
    type: 'hero',
    badge: '',
    title: '',
    subtitle: '',
    primaryBtnText: '',
    primaryBtnLink: '',
    image: '',
    topTagText: 'Premium Silk • ₹4,999',
    bottomTagText: '4.9 · 2,300 Reviews',
    displayOrder: 0,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/banners/admin/all');
      if (data.success) {
        setBanners(data.data);
        const ann = data.data.find((b) => b.type === 'announcement');
        if (ann) {
          setAnnouncementBannerId(ann._id);
          setAnnouncementsText(ann.announcements.map((a) => a.text).join('\n'));
        }
      }
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      const { data } = await API.post('/upload/single?category=banners', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        if (isEdit) {
          setEditSlide((p) => ({ ...p, image: data.url }));
        } else {
          setNewSlide((p) => ({ ...p, image: data.url }));
        }
        toast.success('Image uploaded!');
      }
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.image) {
      toast.error('Title and image are required');
      return;
    }
    try {
      const { data } = await API.post('/banners', newSlide);
      if (data.success) {
        toast.success('Slide created!');
        setNewSlide({
          type: 'hero',
          badge: '',
          title: '',
          subtitle: '',
          primaryBtnText: '',
          primaryBtnLink: '',
          image: '',
          topTagText: 'Premium Silk • ₹4,999',
          bottomTagText: '4.9 · 2,300 Reviews',
          displayOrder: 0,
        });
        fetchBanners();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateSlide = async (e) => {
    e.preventDefault();
    if (!editSlide.title || !editSlide.image) {
      toast.error('Title and image are required');
      return;
    }
    try {
      const { data } = await API.put(`/banners/${editSlide._id}`, editSlide);
      if (data.success) {
        toast.success('Slide updated!');
        setEditSlide(null);
        fetchBanners();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveAnnouncements = async (e) => {
    e.preventDefault();
    const list = announcementsText
      .split('\n')
      .map((t, i) => ({ text: t.trim(), order: i }))
      .filter((a) => a.text);
    try {
      let res;
      if (announcementBannerId) {
        res = await API.put(`/banners/${announcementBannerId}`, { announcements: list });
      } else {
        res = await API.post('/banners', { type: 'announcement', title: 'Announcements', announcements: list });
      }
      if (res.data.success) toast.success('Announcements saved!');
    } catch {
      toast.error('Failed to save announcements');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      const { data } = await API.delete(`/banners/${id}`);
      if (data.success) {
        toast.success('Slide deleted');
        fetchBanners();
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const heroSlides = banners.filter((b) => b.type === 'hero');



  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Banners & Slides</div>
          <div className="crm-page-sub">Manage hero slider popups and announcement bar</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Left: Hero Slides + Add / Edit Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Existing slides grid */}
          <div className="crm-card">
            <div className="crm-card-header">
              <span className="crm-card-title">Hero Slider Slides</span>
              <span className="badge-crm accent">{heroSlides.length} slides</span>
            </div>
            <div className="crm-card-body">
              {loading ? (
                <div className="crm-loading" style={{ minHeight: '120px' }}><div className="crm-spinner"></div></div>
              ) : heroSlides.length === 0 ? (
                <div className="crm-empty" style={{ minHeight: '100px' }}><i className="bi bi-images"></i><p>No slides yet.</p></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                  {heroSlides.map((b) => (
                    <div key={b._id} style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                      <img
                        src={getImageUrl(b.image)}
                        alt="slide"
                        style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, fontSize: '12.5px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.title.replace(/<\/?[^>]+(>|$)/g, '')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--txt-secondary)', marginBottom: '4px' }}>
                          🔴 Top: <strong>{b.topTagText || 'Premium Silk • ₹4,999'}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--txt-secondary)', marginBottom: '8px' }}>
                          ⭐ Bottom: <strong>{b.bottomTagText || '4.9 · 2,300 Reviews'}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-crm btn-crm-outline btn-crm-sm"
                            style={{ flex: 1 }}
                            onClick={() => setEditSlide(b)}
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                          <button
                            className="btn-crm btn-crm-danger btn-crm-sm"
                            onClick={() => handleDelete(b._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form: Add or Edit Hero Slide */}
          <div className="crm-card">
            <div className="crm-card-header">
              <span className="crm-card-title">
                {editSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
              </span>
              {editSlide && (
                <button
                  className="btn-crm btn-crm-outline btn-crm-sm"
                  onClick={() => setEditSlide(null)}
                >
                  <i className="bi bi-x-lg"></i> Cancel Edit
                </button>
              )}
            </div>
            <div className="crm-card-body">
              <form onSubmit={editSlide ? handleUpdateSlide : handleAddSlide}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="crm-label">Badge Text</label>
                    <input
                      className="crm-input"
                      placeholder="e.g. ✨ NEW COLLECTION 2025"
                      value={editSlide ? editSlide.badge || '' : newSlide.badge}
                      onChange={(e) =>
                        editSlide
                          ? setEditSlide({ ...editSlide, badge: e.target.value })
                          : setNewSlide({ ...newSlide, badge: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="crm-label">Title *</label>
                    <input
                      className="crm-input"
                      placeholder="e.g. Drape Yourself in <span>Royal Silk</span>"
                      value={editSlide ? editSlide.title || '' : newSlide.title}
                      onChange={(e) =>
                        editSlide
                          ? setEditSlide({ ...editSlide, title: e.target.value })
                          : setNewSlide({ ...newSlide, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="crm-label">Subtitle</label>
                    <input
                      className="crm-input"
                      placeholder="Supporting description text..."
                      value={editSlide ? editSlide.subtitle || '' : newSlide.subtitle}
                      onChange={(e) =>
                        editSlide
                          ? setEditSlide({ ...editSlide, subtitle: e.target.value })
                          : setNewSlide({ ...newSlide, subtitle: e.target.value })
                      }
                    />
                  </div>
                  
                  {/* Image Popup Tags */}
                  <div className="form-group">
                    <label className="crm-label">🔴 Top Image Tag / Popup</label>
                    <input
                      className="crm-input"
                      placeholder="e.g. Premium Silk • ₹4,999"
                      value={editSlide ? editSlide.topTagText || '' : newSlide.topTagText}
                      onChange={(e) =>
                        editSlide
                          ? setEditSlide({ ...editSlide, topTagText: e.target.value })
                          : setNewSlide({ ...newSlide, topTagText: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="crm-label">⭐ Bottom Image Tag / Popup</label>
                    <input
                      className="crm-input"
                      placeholder="e.g. 4.9 · 2,300 Reviews"
                      value={editSlide ? editSlide.bottomTagText || '' : newSlide.bottomTagText}
                      onChange={(e) =>
                        editSlide
                          ? setEditSlide({ ...editSlide, bottomTagText: e.target.value })
                          : setNewSlide({ ...newSlide, bottomTagText: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="crm-label">Button Text</label>
                    <input
                      className="crm-input"
                      placeholder="Shop Now"
                      value={editSlide ? editSlide.primaryBtnText || '' : newSlide.primaryBtnText}
                      onChange={(e) =>
                        editSlide
                          ? setEditSlide({ ...editSlide, primaryBtnText: e.target.value })
                          : setNewSlide({ ...newSlide, primaryBtnText: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="crm-label">Button Link</label>
                    <input
                      className="crm-input"
                      placeholder="/shop"
                      value={editSlide ? editSlide.primaryBtnLink || '' : newSlide.primaryBtnLink}
                      onChange={(e) =>
                        editSlide
                          ? setEditSlide({ ...editSlide, primaryBtnLink: e.target.value })
                          : setNewSlide({ ...newSlide, primaryBtnLink: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="crm-label">Slide Image *</label>
                    <input
                      type="file"
                      className="crm-input"
                      style={{ padding: '7px' }}
                      onChange={(e) => handleImageUpload(e, !!editSlide)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="crm-label">Display Order</label>
                    <input
                      type="number"
                      className="crm-input"
                      value={editSlide ? editSlide.displayOrder : newSlide.displayOrder}
                      onChange={(e) =>
                        editSlide
                          ? setEditSlide({ ...editSlide, displayOrder: Number(e.target.value) })
                          : setNewSlide({ ...newSlide, displayOrder: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                {(editSlide?.image || newSlide.image) && (
                  <div style={{ marginBottom: '14px' }}>
                    <img
                      src={getImageUrl(editSlide ? editSlide.image : newSlide.image)}
                      alt="preview"
                      style={{ height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {editSlide && (
                    <button
                      type="button"
                      className="btn-crm btn-crm-outline"
                      style={{ flex: 1 }}
                      onClick={() => setEditSlide(null)}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-crm btn-crm-primary"
                    style={{ flex: 1 }}
                  >
                    <i className={editSlide ? 'bi bi-check-lg' : 'bi bi-plus-lg'}></i>{' '}
                    {editSlide ? 'Update Hero Slide' : 'Add Hero Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Announcement Bar */}
        <div className="crm-card" style={{ alignSelf: 'start' }}>
          <div className="crm-card-header"><span className="crm-card-title">Announcement Bar</span></div>
          <div className="crm-card-body">
            <p style={{ fontSize: '12.5px', color: 'var(--txt-muted)', marginBottom: '12px' }}>
              Enter one announcement per line. They will rotate automatically on the frontend.
            </p>
            <form onSubmit={handleSaveAnnouncements}>
              <div className="form-group">
                <label className="crm-label">Announcements</label>
                <textarea
                  className="crm-textarea"
                  rows="10"
                  value={announcementsText}
                  onChange={(e) => setAnnouncementsText(e.target.value)}
                  placeholder={"✨ Free Shipping above ₹999\n🎁 Use code VASTRA20 for 20% off\n🛍️ New arrivals every week!"}
                />
              </div>
              <button type="submit" className="btn-crm btn-crm-primary" style={{ width: '100%' }}>
                Save Announcements
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banners;
