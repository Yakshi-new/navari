import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', parent: '', image: '', displayOrder: 0 });
  const [editCat, setEditCat] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/categories');
      if (data.success) setCategories(data.data);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleImageUpload = async (e, setState, state) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const { data } = await API.post('/upload/single?category=categories', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setState({ ...state, image: data.url });
        toast.success('Category image uploaded!');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    try {
      const payload = { ...newCat, parent: newCat.parent || null };
      const { data } = await API.post('/categories', payload);
      if (data.success) {
        toast.success('Category created!');
        setNewCat({ name: '', description: '', parent: '', image: '', displayOrder: 0 });
        fetchCategories();
      }
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editCat, parent: editCat.parent || null };
      const { data } = await API.put(`/categories/${editCat._id}`, payload);
      if (data.success) {
        toast.success('Category updated!');
        setEditCat(null);
        fetchCategories();
      }
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    try {
      const { data } = await API.delete(`/categories/${id}`);
      if (data.success) { toast.success('Category deactivated'); fetchCategories(); }
    } catch (err) { toast.error(err.message); }
  };

  // Main categories for parent dropdown
  const mainCategories = categories.filter((c) => !c.parent);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const FormFields = ({ state, setState, onSubmit, submitLabel, onCancel }) => (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label className="crm-label">Category Name *</label>
        <input className="crm-input" value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} required placeholder="e.g. Silk Sarees" />
      </div>
      <div className="form-group">
        <label className="crm-label">Parent Category (Optional)</label>
        <select
          className="crm-select"
          value={typeof state.parent === 'object' ? (state.parent?._id || '') : (state.parent || '')}
          onChange={(e) => setState({ ...state, parent: e.target.value })}
        >
          <option value="">None (Main Category)</option>
          {mainCategories
            .filter((c) => c._id !== state._id)
            .map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
        </select>
        <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
          Select a parent category to create a Subcategory.
        </span>
      </div>
      <div className="form-group">
        <label className="crm-label">Category Image</label>
        <input
          type="file"
          className="crm-input"
          style={{ padding: '7px' }}
          onChange={(e) => handleImageUpload(e, setState, state)}
        />
        {state.image && (
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={getImageUrl(state.image)}
              alt="Preview"
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <button
              type="button"
              className="btn-crm btn-crm-danger btn-crm-sm"
              onClick={() => setState({ ...state, image: '' })}
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="crm-label">Description</label>
        <input className="crm-input" value={state.description || ''} onChange={(e) => setState({ ...state, description: e.target.value })} placeholder="Short description" />
      </div>
      <div className="form-group">
        <label className="crm-label">Display Order</label>
        <input type="number" className="crm-input" value={state.displayOrder} onChange={(e) => setState({ ...state, displayOrder: Number(e.target.value) })} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {onCancel && <button type="button" className="btn-crm btn-crm-outline" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn-crm btn-crm-primary" style={{ flex: 1 }} disabled={uploading}>
          {uploading ? 'Uploading...' : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Categories & Subcategories</div>
          <div className="crm-page-sub">{categories.length} total categories across main & subcategories</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        {/* Category List */}
        <div className="crm-card">
          <div className="crm-card-header"><span className="crm-card-title">Category Tree</span></div>
          {loading ? (
            <div className="crm-loading" style={{ minHeight: '200px' }}><div className="crm-spinner"></div></div>
          ) : (
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Type</th>
                    <th>Parent Category</th>
                    <th>Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const isSub = !!cat.parent;
                    const parentName = typeof cat.parent === 'object' ? cat.parent?.name : categories.find(c => c._id === cat.parent)?.name;
                    return (
                      <tr key={cat._id} style={isSub ? { backgroundColor: 'rgba(248, 250, 252, 0.6)' } : {}}>
                        <td>
                          {cat.image ? (
                            <img
                              src={getImageUrl(cat.image)}
                              alt={cat.name}
                              style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          ) : (
                            <div style={{ width: '38px', height: '38px', background: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px' }}>
                              <i className="bi bi-image"></i>
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: isSub ? 500 : 700, paddingLeft: isSub ? '20px' : '12px' }}>
                          {isSub && <i className="bi bi-arrow-return-right me-2 text-muted" style={{ marginRight: '6px' }}></i>}
                          {cat.name}
                        </td>
                        <td>
                          <span className={`badge-crm ${isSub ? 'secondary' : 'accent'}`}>
                            {isSub ? 'Subcategory' : 'Main Category'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--txt-secondary)' }}>
                          {parentName ? <span className="badge-crm outline">{parentName}</span> : '—'}
                        </td>
                        <td><span className="badge-crm secondary">{cat.displayOrder}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {!isSub && (
                              <button
                                className="btn-crm btn-crm-outline btn-crm-sm"
                                title="Add Subcategory under this parent"
                                onClick={() => {
                                  setEditCat(null);
                                  setNewCat({ name: '', description: '', parent: cat._id, image: '', displayOrder: 0 });
                                }}
                              >
                                <i className="bi bi-plus-circle"></i> Sub
                              </button>
                            )}
                            <button className="btn-crm btn-crm-outline btn-crm-sm" onClick={() => setEditCat(cat)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn-crm btn-crm-danger btn-crm-sm" onClick={() => handleDelete(cat._id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Panel */}
        <div className="crm-card">
          <div className="crm-card-header">
            <span className="crm-card-title">{editCat ? 'Edit Category' : 'Add New Category'}</span>
            {editCat && (
              <button className="btn-crm btn-crm-outline btn-crm-sm" onClick={() => setEditCat(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
          <div className="crm-card-body">
            {editCat ? (
              <FormFields state={editCat} setState={setEditCat} onSubmit={handleUpdate} submitLabel="Update Category" onCancel={() => setEditCat(null)} />
            ) : (
              <FormFields state={newCat} setState={setNewCat} onSubmit={handleCreate} submitLabel="Create Category" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
