import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (user) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    const res = await register(name, email, password, phone);
    setLoading(false);

    if (res.success) {
      toast.success('Account created successfully!');
      navigate(redirect ? `/${redirect}` : '/');
    } else {
      toast.error(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="py-5 bg-light d-flex align-items-center" style={{ minHeight: '80vh' }}>
      <SEO
        title="Register"
        description="Register a new customer account at Navari to save items to your wishlist and checkout."
      />
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="card shadow border-0 p-4 p-md-5 bg-white rounded">
          
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold text-dark mb-1">Create Account</h1>
            <p className="text-muted small">Join Navari premium ethnic fashion portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Full Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ananya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Phone Number (Optional)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold text-muted">Password</label>
              <input
                type="password"
                className="form-control form-control-sm"
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-hero-primary w-100 py-2 mb-3" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <p className="text-center small text-muted mb-0">
              Already have an account? <Link to={`/login${redirect ? `?redirect=${redirect}` : ''}`} className="text-crimson fw-semibold text-decoration-none">Sign In</Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;
