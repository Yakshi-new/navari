import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    occasion: 'all',
    fabric: '',
    price: 0,
    discountPrice: 0,
    stock: 0,
    sizes: 'Free Size',
    colors: [],
    tags: '',
    isFeatured: false,
    isNew: false,
    isSale: false,
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [colorInput, setColorInput] = useState({ name: '', hex: '#C41E3A' });

  useEffect(() => {
    const fetchInitData = async () => {
      setLoading(true);
      try {
        const { data: catData } = await API.get('/categories');
        if (catData.success) setCategories(catData.data);

        if (isEditMode) {
          const { data: prodData } = await API.get(`/products/${id}`);
          if (prodData.success) {
            const p = prodData.data;
            setFormData({
              name: p.name || '',
              description: p.description || '',
              shortDescription: p.shortDescription || '',
              category: p.category?._id || '',
              subcategory: p.subcategory || '',
              occasion: p.occasion || 'all',
              fabric: p.fabric || '',
              price: p.price || 0,
              discountPrice: p.discountPrice || 0,
              stock: p.stock || 0,
              sizes: p.sizes?.join(', ') || 'Free Size',
              colors: p.colors || [],
              tags: p.tags?.join(', ') || '',
              isFeatured: p.isFeatured || false,
              isNew: p.isNew || false,
              isSale: p.isSale || false,
              images: p.images || [],
            });
          }
        }
      } catch (err) {
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitData();
  }, [id, isEditMode]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const matchedCat = categories.find((c) => c._id === formData.category);
    const categoryName = matchedCat ? matchedCat.name : 'general';

    const uploadData = new FormData();
    files.forEach((file) => uploadData.append('images', file));

    setSaving(true);
    try {
      const { data } = await API.post(`/upload/multiple?category=${categoryName}`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls],
        }));
        toast.success('Images uploaded successfully!');
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddColor = () => {
    if (!colorInput.name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, colorInput],
    }));
    setColorInput({ name: '', hex: '#C41E3A' });
  };

  const handleRemoveColor = (idx) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setSaving(true);
    try {
      const cleanData = {
        ...formData,
        sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      let res;
      if (isEditMode) {
        res = await API.put(`/products/${id}`, cleanData);
      } else {
        res = await API.post('/products', cleanData);
      }

      if (res.data.success) {
        toast.success(isEditMode ? 'Product updated successfully' : 'Product created successfully');
        navigate('/admin/products');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-crimson" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 p-4 bg-white rounded">
      <h3 className="h5 fw-bold mb-4">{isEditMode ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Product Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Category</label>
            <select
              className="form-select form-select-sm"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Subcategory</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Silk Sarees"
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold text-muted">Description</label>
            <textarea
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Short Description</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Occasion</label>
            <select
              className="form-select form-select-sm"
              value={formData.occasion}
              onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
            >
              <option value="all">All Occasions</option>
              <option value="bridal">Bridal Wear</option>
              <option value="festive">Festive Wear</option>
              <option value="party">Party Wear</option>
              <option value="casual">Casual Wear</option>
              <option value="office">Office Wear</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Fabric Type</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Banarasi Silk"
              value={formData.fabric}
              onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Price (₹)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Discount Price (₹)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Stock Quantity</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Sizes (Comma Separated)</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
            />
          </div>

          {/* Color swatches */}
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Color Variations</label>
            <div className="d-flex gap-2 mb-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Color Name (e.g. Crimson)"
                value={colorInput.name}
                onChange={(e) => setColorInput({ ...colorInput, name: e.target.value })}
              />
              <input
                type="color"
                className="form-control form-control-color form-control-sm"
                value={colorInput.hex}
                onChange={(e) => setColorInput({ ...colorInput, hex: e.target.value })}
              />
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={handleAddColor}>Add</button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {formData.colors.map((c, idx) => (
                <span key={idx} className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2">
                  <span className="d-inline-block rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: c.hex }}></span>
                  {c.name}
                  <i className="bi bi-x text-danger cursor-pointer" onClick={() => handleRemoveColor(idx)}></i>
                </span>
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Tags (Comma Separated)</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. silk, zari, banarasi"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          {/* Upload Images */}
          <div className="col-12">
            <label className="form-label small fw-semibold text-muted">Upload Images (Local Storage)</label>
            <input
              type="file"
              className="form-control form-control-sm mb-2"
              multiple
              disabled={!formData.category}
              onChange={handleImageUpload}
            />
            <div className="d-flex gap-2 flex-wrap">
              {formData.images.map((img, idx) => (
                <div key={idx} className="position-relative">
                  <img
                    src={getImageUrl(img)}
                    alt="preview"
                    style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                    style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                    onClick={() => setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Badges / Checkboxes */}
          <div className="col-12 d-flex gap-4 flex-wrap mt-3">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <label className="form-check-label small text-muted" htmlFor="isFeatured">Featured Product</label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isNew"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
              />
              <label className="form-check-label small text-muted" htmlFor="isNew">Mark as New</label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isSale"
                checked={formData.isSale}
                onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
              />
              <label className="form-check-label small text-muted" htmlFor="isSale">Mark on Sale</label>
            </div>
          </div>

        </div>

        <div className="d-flex gap-3 justify-content-end mt-4">
          <button type="button" className="btn btn-sm btn-outline-secondary px-4" onClick={() => navigate('/admin/products')}>Cancel</button>
          <button type="submit" className="btn btn-sm btn-hero-primary px-4" disabled={saving}>
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
