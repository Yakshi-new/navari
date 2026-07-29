import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const OCCASIONS = ['all', 'bridal', 'festive', 'party', 'casual', 'office'];

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [colorInput, setColorInput] = useState({ name: '', hex: '#6366f1' });

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '',
    category: '', subcategory: '', occasion: 'all', fabric: '',
    price: 0, discountPrice: 0, stock: 0,
    sizes: 'Free Size', colors: [], tags: '',
    isFeatured: false, isNew: false, isSale: false, images: [],
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: catData } = await API.get('/categories');
        if (catData.success) setCategories(catData.data);
        if (isEdit) {
          const { data: prodData } = await API.get(`/products/${id}`);
          if (prodData.success) {
            const p = prodData.data;
            setForm({
              name: p.name || '', description: p.description || '',
              shortDescription: p.shortDescription || '',
              category: p.category?._id || '', subcategory: p.subcategory || '',
              occasion: p.occasion || 'all', fabric: p.fabric || '',
              price: p.price || 0, discountPrice: p.discountPrice || 0,
              stock: p.stock || 0,
              sizes: p.sizes?.join(', ') || 'Free Size',
              colors: p.colors || [],
              tags: p.tags?.join(', ') || '',
              isFeatured: p.isFeatured || false, isNew: p.isNew || false,
              isSale: p.isSale || false, images: p.images || [],
            });
          }
        }
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const catName = categories.find((c) => c._id === form.category)?.name || 'general';
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    setSaving(true);
    try {
      const { data } = await API.post(`/upload/multiple?category=${catName}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        set('images', [...form.images, ...data.urls]);
        toast.success('Images uploaded!');
      }
    } catch { toast.error('Upload failed'); }
    finally { setSaving(false); }
  };

  const addColor = () => {
    if (!colorInput.name.trim()) return;
    set('colors', [...form.colors, colorInput]);
    setColorInput({ name: '', hex: '#6366f1' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = isEdit
        ? await API.put(`/products/${id}`, payload)
        : await API.post('/products', payload);
      if (res.data.success) {
        toast.success(isEdit ? 'Product updated!' : 'Product created!');
        navigate('/products');
      }
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="crm-loading"><div className="crm-spinner"></div></div>;

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</div>
          <div className="crm-page-sub">{isEdit ? `Editing product ID: ${id}` : 'Fill in all required fields'}</div>
        </div>
        <button className="btn-crm btn-crm-outline" onClick={() => navigate('/products')}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Basic Info */}
            <div className="crm-card">
              <div className="crm-card-header"><span className="crm-card-title">Basic Information</span></div>
              <div className="crm-card-body">
                <div className="form-group">
                  <label className="crm-label">Product Name *</label>
                  <input className="crm-input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Kanjivaram Silk Saree" />
                </div>
                <div className="form-group">
                  <label className="crm-label">Description *</label>
                  <textarea className="crm-textarea" rows="5" value={form.description} onChange={(e) => set('description', e.target.value)} required placeholder="Detailed product description..." />
                </div>
                <div className="form-group">
                  <label className="crm-label">Short Description</label>
                  <input className="crm-input" value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="One-line summary" />
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="crm-card">
              <div className="crm-card-header"><span className="crm-card-title">Classification</span></div>
              <div className="crm-card-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="crm-label">Category *</label>
                    <select className="crm-select" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                      <option value="">Select Category</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="crm-label">Subcategory</label>
                    <input className="crm-input" value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} placeholder="e.g. Silk Sarees" />
                  </div>
                  <div className="form-group">
                    <label className="crm-label">Occasion</label>
                    <select className="crm-select" value={form.occasion} onChange={(e) => set('occasion', e.target.value)}>
                      {OCCASIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="crm-label">Fabric Type</label>
                    <input className="crm-input" value={form.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="e.g. Banarasi Silk" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="crm-label">Tags (comma-separated)</label>
                  <input className="crm-input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="e.g. silk, zari, banarasi, traditional" />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="crm-card">
              <div className="crm-card-header"><span className="crm-card-title">Product Images</span></div>
              <div className="crm-card-body">
                <div className="form-group">
                  <label className="crm-label">Upload Images {!form.category && <span style={{ color: 'var(--clr-warning)' }}>(select category first)</span>}</label>
                  <input
                    type="file"
                    className="crm-input"
                    style={{ padding: '7px' }}
                    multiple
                    disabled={!form.category}
                    onChange={handleImageUpload}
                  />
                </div>
                {form.images.length > 0 && (
                  <div className="img-preview-grid">
                    {form.images.map((img, i) => (
                      <div key={i} className="img-preview-item">
                        <img src={getImageUrl(img)} alt="" />
                        <button type="button" className="img-preview-remove" onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Pricing & Stock */}
            <div className="crm-card">
              <div className="crm-card-header"><span className="crm-card-title">Pricing & Stock</span></div>
              <div className="crm-card-body">
                <div className="form-group">
                  <label className="crm-label">Price (₹) *</label>
                  <input type="number" className="crm-input" value={form.price} onChange={(e) => set('price', Number(e.target.value))} required min="0" />
                </div>
                <div className="form-group">
                  <label className="crm-label">Discount Price (₹)</label>
                  <input type="number" className="crm-input" value={form.discountPrice} onChange={(e) => set('discountPrice', Number(e.target.value))} min="0" />
                </div>
                {form.price > 0 && form.discountPrice > 0 && (
                  <div style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: 'var(--clr-success)' }}>
                    {Math.round(((form.price - form.discountPrice) / form.price) * 100)}% discount applied
                  </div>
                )}
                <div className="form-group">
                  <label className="crm-label">Stock Quantity *</label>
                  <input type="number" className="crm-input" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} required min="0" />
                </div>
                <div className="form-group">
                  <label className="crm-label">Sizes (comma-separated)</label>
                  <input className="crm-input" value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="Free Size, S, M, L, XL" />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="crm-card">
              <div className="crm-card-header"><span className="crm-card-title">Color Variants</span></div>
              <div className="crm-card-body">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input className="crm-input" placeholder="Color name" value={colorInput.name} onChange={(e) => setColorInput({ ...colorInput, name: e.target.value })} />
                  <input type="color" style={{ width: '42px', height: '38px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', padding: '2px' }} value={colorInput.hex} onChange={(e) => setColorInput({ ...colorInput, hex: e.target.value })} />
                  <button type="button" className="btn-crm btn-crm-outline btn-crm-sm" onClick={addColor} style={{ whiteSpace: 'nowrap' }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.colors.map((c, i) => (
                    <span key={i} className="color-swatch">
                      <span className="color-dot" style={{ backgroundColor: c.hex }}></span>
                      {c.name}
                      <span className="color-remove" onClick={() => set('colors', form.colors.filter((_, idx) => idx !== i))}>×</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="crm-card">
              <div className="crm-card-header"><span className="crm-card-title">Product Badges</span></div>
              <div className="crm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'isFeatured', label: 'Featured Product', desc: 'Show on homepage featured section' },
                  { key: 'isNew', label: 'Mark as New', desc: 'Display "New" badge on product card' },
                  { key: 'isSale', label: 'Mark on Sale', desc: 'Display "Sale" badge on product card' },
                ].map(({ key, label, desc }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => set(key, e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--clr-accent)', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--txt-muted)' }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="submit" className="btn-crm btn-crm-primary" disabled={saving} style={{ padding: '12px' }}>
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="btn-crm btn-crm-outline" onClick={() => navigate('/products')} style={{ padding: '12px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
