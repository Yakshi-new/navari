import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { data } = await API.put(`/auth/reset-password/${token}`, { password });
      if (data.success) {
        toast.success('Password reset successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light d-flex align-items-center" style={{ minHeight: '80vh' }}>
      <SEO title="Reset Password" description="Enter a new password for your Navari account." />
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="card shadow border-0 p-4 p-md-5 bg-white rounded">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold text-dark mb-1">Reset Password</h1>
            <p className="text-muted small">Enter a new secure password for your account</p>
          </div>

          {error && <div className="alert alert-danger small mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label small fw-semibold text-muted">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-hero-primary w-100" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
