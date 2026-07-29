import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * On mount: check if we were redirected here due to a forced logout.
   * The reason is stored in sessionStorage by:
   *   - useInactivityLogout (5-min timer)
   *   - api.js 401 interceptor (new login from another device)
   * Display it as a toast so the admin understands why they were kicked out.
   */
  useEffect(() => {
    const reason = sessionStorage.getItem('logout_reason');
    if (reason) {
      // Short delay so the page has fully rendered before toast appears
      const tid = setTimeout(() => {
        toast.error(reason, { duration: 6000, id: 'forced-logout-reason' });
      }, 300);
      sessionStorage.removeItem('logout_reason');
      return () => clearTimeout(tid);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Admin login successful!');
      navigate('/');
    } else {
      const errorMsg = result.error || 'Invalid email or password';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="crm-login-page">
      <div className="crm-login-card">
        <div className="crm-login-logo">
          <div className="big-icon">N</div>
          <h1>Navari CRM</h1>
          <p>Admin Portal — Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="crm-login-label">Email Address</label>
            <input
              id="admin-email"
              type="email"
              className="crm-login-input"
              placeholder="admin@navari.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="crm-login-label" style={{ marginBottom: '0' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#B81C38', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</Link>
            </div>
            <input
              id="admin-password"
              type="password"
              className="crm-login-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-danger small" style={{ color: '#ef4444', fontSize: '12.5px', marginTop: '-12px', marginBottom: '20px', fontWeight: '500' }}>
              <i className="bi bi-exclamation-circle-fill" style={{ marginRight: '6px' }}></i>
              {error}
            </p>
          )}

          <button type="submit" className="btn-crm-login" disabled={loading} id="admin-login-btn">
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', marginRight: '8px' }}></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-shield-lock-fill" style={{ marginRight: '8px' }}></i>
                Sign In to Admin Panel
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '11.5px', color: '#475569' }}>
          This portal is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
};

export default Login;
