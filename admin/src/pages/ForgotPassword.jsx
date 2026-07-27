import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      if (data.success) {
        setMessage(data.message);
        toast.success('Password reset link sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crm-login-page">
      <div className="crm-login-card">
        <div className="crm-login-logo">
          <div className="big-icon">N</div>
          <h1>Forgot Password</h1>
          <p>Admin Portal — Password Recovery</p>
        </div>

        {message && (
          <div className="alert alert-success small mb-3 text-success p-2 bg-success bg-opacity-10 border border-success border-opacity-20 rounded" style={{ fontSize: '12.5px', marginBottom: '16px', color: '#16a34a' }}>
            {message}
          </div>
        )}
        {error && <div className="crm-login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="crm-login-label">Email Address</label>
            <input
              type="email"
              className="crm-login-input"
              placeholder="admin@navari.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-crm-login" disabled={loading}>
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '12px' }}>
          <Link to="/login" style={{ color: '#B81C38', fontWeight: '600', textDecoration: 'none' }}>
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
