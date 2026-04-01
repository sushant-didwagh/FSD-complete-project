import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!form.password) {
      toast.error('Password is required');
      return false;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const { token, ...userData } = data.data;
      login(userData, token);

      const name = userData.fullName || userData.email?.split('@')[0] || 'User';
      toast.success(`Welcome back, ${name}! 👋`);

      const redirects = {
        student: '/student/dashboard',
        mentor: '/mentor/dashboard',
        admin: '/admin/panel',
      };
      navigate(redirects[userData.role] || '/');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        toast.error(message || 'Invalid email or password. Please check your credentials.');
      } else if (status === 403) {
        toast.error(message || 'Account not yet approved. Please wait for admin verification.');
      } else if (status === 404) {
        toast.error('No account found with this email. Please register first.');
      } else {
        toast.error(message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '30%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem' }}>🎓</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '0.25rem' }}>Welcome Back</h1>
          <p style={{ color: '#64748b' }}>Sign in to Student Buddy</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {['👨‍🎓 Student', '👨‍🏫 Mentor', '🛡️ Admin'].map((r) => (
              <span key={r} style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: '600' }}>{r}</span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Your password (min. 6 characters)"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.1rem' }}
                >
                  {showPass ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
            >
              {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '🔐 Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            <div>
              Don't have a student account?{' '}
              <Link to="/register/student" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: '600' }}>
                Register as Student →
              </Link>
            </div>
            <div>
              Are you a mentor?{' '}
              <Link to="/register/mentor" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: '600' }}>
                Register as Mentor →
              </Link>
            </div>
          </div>

          {/* Mentor pending note */}
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.625rem', fontSize: '0.8rem', color: '#f59e0b' }}>
            ⏳ <strong>Mentor note:</strong> After registration, your account needs admin approval before you can sign in.
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
