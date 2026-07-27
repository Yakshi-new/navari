import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/reviews/admin/all');
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApproveToggle = async (id, currentApproval) => {
    try {
      const { data } = await API.put(`/reviews/${id}`, { isApproved: !currentApproval });
      if (data.success) {
        toast.success(`Review ${!currentApproval ? 'approved' : 'hidden'}`);
        setReviews(reviews.map((r) => (r._id === id ? { ...r, isApproved: !currentApproval } : r)));
      }
    } catch (err) {
      toast.error('Failed to update review approval');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const { data } = await API.delete(`/reviews/${id}`);
      if (data.success) {
        toast.success('Review deleted successfully');
        fetchReviews();
      }
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 bg-white rounded">
      <h3 className="h5 fw-bold mb-4">Moderate Product Reviews</h3>
      
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-crimson"></div></div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="small text-muted text-uppercase">
                <th>Product</th>
                <th>User</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id} style={{ fontSize: '0.88rem' }}>
                  <td className="fw-bold">{r.product?.name || 'Unassigned'}</td>
                  <td>
                    <span className="fw-semibold d-block">{r.user?.name}</span>
                    <span className="small text-muted">{r.user?.email}</span>
                  </td>
                  <td className="text-gold">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi ${i < r.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                    ))}
                  </td>
                  <td>
                    <p className="mb-0 text-muted small" style={{ maxWidth: '280px' }}>"{r.comment}"</p>
                  </td>
                  <td>
                    <span className={`badge ${r.isApproved ? 'bg-success' : 'bg-danger'}`}>
                      {r.isApproved ? 'Approved' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className={`btn btn-sm ${r.isApproved ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => handleApproveToggle(r._id, r.isApproved)}
                      >
                        {r.isApproved ? 'Hide' : 'Approve'}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.78rem' }} onClick={() => handleDelete(r._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
