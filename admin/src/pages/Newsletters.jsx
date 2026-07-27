import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Newsletters = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/newsletter');
      if (data.success) {
        setSubscribers(data.data);
      }
    } catch {
      toast.error('Failed to load newsletter subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove "${email}" from the newsletter list?`)) return;
    try {
      const { data } = await API.delete(`/newsletter/${id}`);
      if (data.success) {
        toast.success('Subscriber removed');
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
      }
    } catch {
      toast.error('Failed to delete subscriber');
    }
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Newsletter Subscribers</div>
          <div className="crm-page-sub">
            View and manage all users subscribed to website fashion updates
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="crm-badge crm-badge-info" style={{ fontSize: '14px', padding: '8px 16px' }}>
            Total Subscribers: {subscribers.length}
          </span>
        </div>
      </div>

      <div className="crm-card mb-4">
        <div className="crm-card-body">
          <div style={{ maxWidth: '350px' }}>
            <input
              type="text"
              className="crm-input"
              placeholder="Search subscriber email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="crm-card">
        <div className="crm-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="crm-loading">
              <div className="crm-spinner"></div>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>
              <i className="bi bi-envelope-x fs-1 mb-2 d-block"></i>
              No newsletter subscribers found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email Address</th>
                    <th>Subscribed On</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub, idx) => (
                    <tr key={sub._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong style={{ color: 'var(--txt-dark)' }}>{sub.email}</strong>
                      </td>
                      <td>{new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span className="crm-badge crm-badge-success">Active</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-crm btn-crm-outline btn-crm-sm"
                          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => handleDelete(sub._id, sub.email)}
                        >
                          <i className="bi bi-trash me-1"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsletters;
