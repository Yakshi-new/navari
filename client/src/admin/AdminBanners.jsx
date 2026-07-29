import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newSlide, setNewSlide] = useState({
    type: 'hero',
    badge: '',
    title: '',
    subtitle: '',
    primaryBtnText: '',
    primaryBtnLink: '',
    secondaryBtnText: '',
    secondaryBtnLink: '',
    image: '',
    displayOrder: 0,
  });

  const [announcementsText, setAnnouncementsText] = useState('');
  const [announcementBannerId, setAnnouncementBannerId] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/banners/admin/all');
      if (data.success) {
        setBanners(data.data);
        // Find announcement banner if exists
        const announceBanner = data.data.find((b) => b.type === 'announcement');
        if (announceBanner) {
          setAnnouncementBannerId(announceBanner._id);
          setAnnouncementsText(announceBanner.announcements.map((a) => a.text).join('\n'));
        }
      }
    } catch (err) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const { data } = await API.post('/upload/single?category=banners', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setNewSlide((prev) => ({ ...prev, image: data.url }));
        toast.success('Slide image uploaded!');
      }
    } catch (err) {
      toast.error('Image upload failed');
    }
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.image) {
      toast.error('Title and Slide image are required');
      return;
    }

    try {
      const { data } = await API.post('/banners', newSlide);
      if (data.success) {
        toast.success('Hero slide created successfully');
        setNewSlide({
          type: 'hero',
          badge: '',
          title: '',
          subtitle: '',
          primaryBtnText: '',
          primaryBtnLink: '',
          secondaryBtnText: '',
          secondaryBtnLink: '',
          image: '',
          displayOrder: 0,
        });
        fetchBanners();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateAnnouncements = async (e) => {
    e.preventDefault();
    const list = announcementsText
      .split('\n')
      .map((t, idx) => ({ text: t.trim(), order: idx }))
      .filter((a) => a.text);

    try {
      let res;
      if (announcementBannerId) {
        res = await API.put(`/banners/${announcementBannerId}`, { announcements: list });
      } else {
        res = await API.post('/banners', { type: 'announcement', title: 'Announcements', announcements: list });
      }
      if (res.data.success) {
        toast.success('Announcement bar updated successfully!');
        fetchBanners();
      }
    } catch (err) {
      toast.error('Failed to update announcements');
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      const { data } = await API.delete(`/banners/${id}`);
      if (data.success) {
        toast.success('Slide deleted');
        fetchBanners();
      }
    } catch (err) {
      toast.error('Failed to delete slide');
    }
  };

  return (
    <div className="row g-4">
      
      {/* HERO SLIDES MANAGING */}
      <div className="col-md-8">
        <div className="card shadow-sm border-0 p-4 bg-white rounded mb-4">
          <h3 className="h6 fw-bold mb-4">Hero Slider Slides</h3>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-crimson"></div></div>
          ) : (
            <div className="row g-3">
              {banners.filter((b) => b.type === 'hero').map((banner) => (
                <div key={banner._id} className="col-md-6">
                  <div className="card border rounded overflow-hidden">
                    <img
                      src={getImageUrl(banner.image)}
                      alt="slide"
                      style={{ height: '140px', objectFit: 'cover' }}
                    />
                    <div className="card-body p-3">
                      <h4 className="h6 fw-bold text-dark text-truncate mb-1">{banner.title.replace(/<\/?[^>]+(>|$)/g, "")}</h4>
                      <span className="small text-muted d-block mb-3">Order: {banner.displayOrder}</span>
                      <button className="btn btn-sm btn-outline-danger w-100" onClick={() => handleDeleteSlide(banner._id)}>
                        Delete Slide
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card shadow-sm border-0 p-4 bg-white rounded">
          <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Add New Hero Slide</h3>
          <form onSubmit={handleAddSlide}>
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Badge (e.g. New Collection)"
                  value={newSlide.badge}
                  onChange={(e) => setNewSlide({ ...newSlide, badge: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Title (supports <span> tags)"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Subtitle"
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Primary Button Text"
                  value={newSlide.primaryBtnText}
                  onChange={(e) => setNewSlide({ ...newSlide, primaryBtnText: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Primary Link (e.g. /shop)"
                  value={newSlide.primaryBtnLink}
                  onChange={(e) => setNewSlide({ ...newSlide, primaryBtnLink: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="file"
                  className="form-control form-control-sm"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Display Order"
                  value={newSlide.displayOrder || ''}
                  onChange={(e) => setNewSlide({ ...newSlide, displayOrder: Number(e.target.value) })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-sm btn-hero-primary w-100 mt-4">
              Add Hero Slide
            </button>
          </form>
        </div>
      </div>

      {/* ANNOUNCEMENT BAR CONTROL */}
      <div className="col-md-4">
        <div className="card shadow-sm border-0 p-4 bg-white rounded">
          <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Announcement Bar</h3>
          <p className="small text-muted">Enter announcements line-by-line (will slide automatically).</p>
          <form onSubmit={handleUpdateAnnouncements}>
            <div className="mb-3">
              <textarea
                className="form-control form-control-sm"
                rows="8"
                value={announcementsText}
                onChange={(e) => setAnnouncementsText(e.target.value)}
                placeholder="✨ Free Shipping above ₹999&#10;🎁 Use code VASTRA20"
              ></textarea>
            </div>
            <button type="submit" className="btn btn-sm btn-hero-primary w-100">
              Save Announcements
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AdminBanners;
