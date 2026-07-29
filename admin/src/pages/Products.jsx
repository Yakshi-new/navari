import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [restockModal, setRestockModal] = useState(null); // { id, name, currentStock, addQty: 10 }
  const [updatingStock, setUpdatingStock] = useState(false);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get('/products/admin/all', {
        params: { page, limit: 12, search },
      });
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      const { data } = await API.delete(`/products/${id}`);
      if (data.success) {
        toast.success('Product deactivated');
        fetchProducts(pagination.page);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockModal) return;
    const newStock = Number(restockModal.currentStock) + Number(restockModal.addQty);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Invalid stock quantity');
      return;
    }
    setUpdatingStock(true);
    try {
      const { data } = await API.put(`/products/${restockModal.id}`, { stock: newStock });
      if (data.success) {
        toast.success(`Stock updated to ${newStock} for "${restockModal.name}"`);
        setRestockModal(null);
        fetchProducts(pagination.page);
      }
    } catch (err) {
      toast.error(err.message || 'Restock failed');
    } finally {
      setUpdatingStock(false);
    }
  };

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Products Inventory</div>
          <div className="crm-page-sub">{pagination.total} total items</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="crm-search">
            <i className="bi bi-search"></i>
            <input
              className="crm-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/products/new" className="btn-crm btn-crm-primary" id="add-product-btn">
            <i className="bi bi-plus-lg"></i> Add Product
          </Link>
        </div>
      </div>

      <div className="crm-card">
        {loading ? (
          <div className="crm-loading" style={{ minHeight: '300px' }}>
            <div className="crm-spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="crm-empty">
            <i className="bi bi-bag-x"></i>
            <p>No products found.</p>
          </div>
        ) : (
          <>
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={getImageUrl(prod.images?.[0])}
                            alt={prod.name}
                            style={{ width: '38px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prod.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>
                              SKU: {prod._id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--txt-secondary)' }}>{prod.category?.name || '—'}</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>
                          ₹{(prod.discountPrice > 0 ? prod.discountPrice : prod.price).toLocaleString('en-IN')}
                        </span>
                        {prod.discountPrice > 0 && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--txt-muted)', fontSize: '11px', marginLeft: '6px' }}>
                            ₹{prod.price}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className={`badge-crm ${
                              prod.stock === 0 ? 'danger' : prod.stock <= 5 ? 'warning' : 'success'
                            }`}
                            style={{ fontWeight: 700 }}
                          >
                            {prod.stock === 0 ? 'Out of Stock (0)' : prod.stock <= 5 ? `Low Stock (${prod.stock})` : `${prod.stock} in stock`}
                          </span>
                          <button
                            className="btn-crm btn-crm-outline btn-crm-sm"
                            title="Restock this product"
                            onClick={() =>
                              setRestockModal({
                                id: prod._id,
                                name: prod.name,
                                currentStock: prod.stock,
                                addQty: 10,
                              })
                            }
                          >
                            <i className="bi bi-box-arrow-in-down"></i> Restock
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-crm ${prod.isActive ? 'success' : 'danger'}`}>
                          {prod.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Link to={`/products/edit/${prod._id}`} className="btn-crm btn-crm-outline btn-crm-sm">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          {prod.isActive && (
                            <button className="btn-crm btn-crm-danger btn-crm-sm" onClick={() => handleDelete(prod._id)}>
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

            {pagination.pages > 1 && (
              <div className="crm-pagination">
                <button
                  className="crm-page-btn"
                  disabled={pagination.page === 1}
                  onClick={() => fetchProducts(pagination.page - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    className={`crm-page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                    onClick={() => fetchProducts(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="crm-page-btn"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => fetchProducts(pagination.page + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
        >
          <div className="crm-card" style={{ width: '400px', margin: '20px' }}>
            <div className="crm-card-header">
              <span className="crm-card-title">Add Stock Quantity</span>
              <button
                className="btn-crm btn-crm-outline btn-crm-sm"
                onClick={() => setRestockModal(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="crm-card-body">
              <p style={{ fontSize: '13px', color: 'var(--txt-secondary)', marginBottom: '14px' }}>
                Adding stock for: <strong>{restockModal.name}</strong>
                <br />
                Current stock: <strong className="text-primary">{restockModal.currentStock}</strong>
              </p>

              <form onSubmit={handleRestockSubmit}>
                <div className="form-group">
                  <label className="crm-label">Quantity to Add (or enter negative number to reduce)</label>
                  <input
                    type="number"
                    className="crm-input"
                    value={restockModal.addQty}
                    onChange={(e) =>
                      setRestockModal({ ...restockModal, addQty: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '12.5px' }}>
                  New Stock total will be: <strong>{Number(restockModal.currentStock) + Number(restockModal.addQty)}</strong> units
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-crm btn-crm-outline"
                    style={{ flex: 1 }}
                    onClick={() => setRestockModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-crm btn-crm-primary"
                    style={{ flex: 1 }}
                    disabled={updatingStock}
                  >
                    {updatingStock ? 'Saving...' : 'Update Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
