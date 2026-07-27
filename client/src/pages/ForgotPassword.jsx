import React, { useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

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
        toast.success('Reset email sent successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light d-flex align-items-center" style={{ minHeight: '80vh' }}>
      <SEO title="Forgot Password" description="Request a password reset link for your Navari account." />
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="card shadow border-0 p-4 p-md-5 bg-white rounded">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold text-dark mb-1">Forgot Password</h1>
            <p className="text-muted small">Enter your email and we'll send you a password reset link</p>
          </div>

          {message && <div className="alert alert-success small mb-3">{message}</div>}
          {error && <div className="alert alert-danger small mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-hero-primary w-100" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 small text-muted">
            Remembered your password? <Link to="/login" className="text-crimson fw-semibold text-decoration-none">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
