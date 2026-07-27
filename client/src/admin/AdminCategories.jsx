import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ name: '', description: '', displayOrder: 0 });
  const [editCat, setEditCat] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/categories');
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    try {
      const { data } = await API.post('/categories', newCat);
      if (data.success) {
        toast.success('Category created successfully!');
        setNewCat({ name: '', description: '', displayOrder: 0 });
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editCat.name.trim()) return;

    try {
      const { data } = await API.put(`/categories/${editCat._id}`, editCat);
      if (data.success) {
        toast.success('Category updated successfully!');
        setEditCat(null);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this category?')) return;
    try {
      const { data } = await API.delete(`/categories/${id}`);
      if (data.success) {
        toast.success('Category deactivated');
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="row g-4">
      
      {/* CATEGORY LIST */}
      <div className="col-md-8">
        <div className="card shadow-sm border-0 p-4 bg-white rounded">
          <h3 className="h6 fw-bold mb-4">Categories</h3>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-4">
              <div className="spinner-border text-crimson" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-muted text-uppercase">
                    <th>Name</th>
                    <th>Description</th>
                    <th>Display Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} style={{ fontSize: '0.88rem' }}>
                      <td className="fw-semibold text-dark">{cat.name}</td>
                      <td>{cat.description || '-'}</td>
                      <td>{cat.displayOrder}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-dark" onClick={() => setEditCat(cat)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE & EDIT FORM */}
      <div className="col-md-4">
        {editCat ? (
          <div className="card shadow-sm border-0 p-4 bg-white rounded">
            <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Edit Category</h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label small text-muted">Category Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted">Description</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={editCat.description || ''}
                  onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted">Display Order</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={editCat.displayOrder}
                  onChange={(e) => setEditCat({ ...editCat, displayOrder: Number(e.target.value) })}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary w-50" onClick={() => setEditCat(null)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-hero-primary w-50">Update</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card shadow-sm border-0 p-4 bg-white rounded">
            <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Add New Category</h3>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small text-muted">Category Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted">Description</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted">Display Order</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={newCat.displayOrder}
                  onChange={(e) => setNewCat({ ...newCat, displayOrder: Number(e.target.value) })}
                />
              </div>
              <button type="submit" className="btn btn-sm btn-hero-primary w-100">
                Create Category
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminCategories;
