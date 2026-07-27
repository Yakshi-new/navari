import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/reviews/admin/all');
      if (data.success) setReviews(data.data);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleApproval = async (id, current) => {
    try {
      const { data } = await API.put(`/reviews/${id}`, { isApproved: !current });
      if (data.success) {
        toast.success(`Review ${!current ? 'approved' : 'hidden'}`);
        setReviews(reviews.map((r) => r._id === id ? { ...r, isApproved: !current } : r));
      }
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const { data } = await API.delete(`/reviews/${id}`);
      if (data.success) { toast.success('Review deleted'); fetchReviews(); }
    } catch { toast.error('Delete failed'); }
  };

  const StarRating = ({ rating }) => (
    <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`bi ${n <= rating ? 'bi-star-fill' : 'bi-star'}`} style={{ fontSize: '12px' }}></i>
      ))}
    </div>
  );

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Reviews</div>
          <div className="crm-page-sub">Moderate and manage customer reviews</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge-crm success">{reviews.filter((r) => r.isApproved).length} Approved</span>
          <span className="badge-crm danger">{reviews.filter((r) => !r.isApproved).length} Pending</span>
        </div>
      </div>

      <div className="crm-card">
        {loading ? (
          <div className="crm-loading" style={{ minHeight: '300px' }}><div className="crm-spinner"></div></div>
        ) : reviews.length === 0 ? (
          <div className="crm-empty"><i className="bi bi-star"></i><p>No reviews yet.</p></div>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.product?.name || 'Deleted Product'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--txt-muted)' }}>{r.user?.email}</div>
                    </td>
                    <td><StarRating rating={r.rating} /></td>
                    <td>
                      <p style={{ maxWidth: '280px', fontSize: '12.5px', color: 'var(--txt-secondary)', margin: 0, fontStyle: 'italic' }}>
                        "{r.comment}"
                      </p>
                    </td>
                    <td>
                      <span className={`badge-crm ${r.isApproved ? 'success' : 'danger'}`}>
                        {r.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className={`btn-crm btn-crm-sm ${r.isApproved ? 'btn-crm-outline' : 'btn-crm-success'}`}
                          onClick={() => toggleApproval(r._id, r.isApproved)}
                        >
                          {r.isApproved ? 'Hide' : 'Approve'}
                        </button>
                        <button className="btn-crm btn-crm-danger btn-crm-sm" onClick={() => handleDelete(r._id)}>
                          <i className="bi bi-trash"></i>
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
    </div>
  );
};

export default Reviews;
