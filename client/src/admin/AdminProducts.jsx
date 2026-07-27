import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get('/products/admin/all', {
        params: { page, limit: 10, search },
      });
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      const { data } = await API.delete(`/products/${productId}`);
      if (data.success) {
        toast.success('Product deactivated successfully');
        // Refresh products list
        fetchProducts(pagination.page);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 bg-white rounded">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h3 className="h5 fw-bold mb-0">Manage Products</h3>
        <div className="d-flex gap-2 flex-grow-1 max-width-md justify-content-end">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search products..."
            style={{ maxWidth: '280px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link to="/admin/products/new" className="btn btn-hero-primary btn-sm text-nowrap">
            <i className="bi bi-plus-lg me-1"></i> Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-crimson" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="small text-muted text-uppercase">
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id} style={{ fontSize: '0.88rem' }}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={prod.images[0]?.startsWith('http') ? prod.images[0] : `http://localhost:5000${prod.images[0]}`}
                          alt={prod.name}
                          style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div>
                          <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: '240px' }}>
                            {prod.name}
                          </span>
                          <span className="small text-muted">SKU: {prod._id.substring(18).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td>{prod.category?.name || 'Unassigned'}</td>
                    <td>
                      <span className="fw-bold">₹{(prod.discountPrice > 0 ? prod.discountPrice : prod.price).toLocaleString('en-IN')}</span>
                      {prod.discountPrice > 0 && <span className="text-muted text-decoration-line-through ms-2 small">₹{prod.price}</span>}
                    </td>
                    <td>
                      <span className={`fw-semibold ${prod.stock <= 5 ? 'text-danger' : 'text-success'}`}>{prod.stock}</span>
                    </td>
                    <td>
                      <span className={`badge ${prod.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/admin/products/edit/${prod._id}`} className="btn btn-sm btn-outline-dark" style={{ padding: '4px 8px' }}>
                          <i className="bi bi-pencil"></i>
                        </Link>
                        {prod.isActive && (
                          <button className="btn btn-sm btn-outline-danger" style={{ padding: '4px 8px' }} onClick={() => handleDelete(prod._id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination pagination-sm">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchProducts(pagination.page - 1)}>
                    Previous
                  </button>
                </li>
                {[...Array(pagination.pages)].map((_, i) => (
                  <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      style={pagination.page === i + 1 ? { backgroundColor: 'var(--clr-crimson)', borderColor: 'var(--clr-crimson)' } : {}}
                      onClick={() => fetchProducts(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchProducts(pagination.page + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;
