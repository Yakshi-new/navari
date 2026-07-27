import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

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
        toast.success('Password reset successful! Please sign in.');
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
    <div className="crm-login-page">
      <div className="crm-login-card">
        <div className="crm-login-logo">
          <div className="big-icon">N</div>
          <h1>Reset Password</h1>
          <p>Admin Portal — Set New Password</p>
        </div>

        {error && <div className="crm-login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="crm-login-label">New Password</label>
            <input
              type="password"
              className="crm-login-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="crm-login-label">Confirm New Password</label>
            <input
              type="password"
              className="crm-login-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-crm-login" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
