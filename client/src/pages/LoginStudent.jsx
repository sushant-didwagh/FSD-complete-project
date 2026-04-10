import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const LoginStudent = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.email.trim()) { toast.error('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Please enter a valid email'); return false; }
    if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
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
      if (userData.role !== 'student') {
        toast.error('This login is for students only. Please use the correct login page.');
        return;
      }
      login(userData, token);
      toast.success(`Welcome back, ${userData.fullName || userData.email?.split('@')[0]}! 👋`);
      navigate('/student/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 401) toast.error(message || 'Invalid email or password.');
      else if (status === 403) toast.error(message || 'Account not yet approved.');
      else if (status === 404) toast.error('No account found. Please register first.');
      else toast.error(message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const accent = '#6366f1';

  return (
    <div style={styles.page}>
      <div style={{ ...styles.orb, top: '15%', left: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
      <div style={{ ...styles.orb, bottom: '15%', right: '15%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={{ ...styles.iconBox, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 8px 32px rgba(99,102,241,0.35)` }}>
            👨‍🎓
          </div>
          <h1 style={styles.title}>Student Sign In</h1>
          <p style={styles.subtitle}>Access your courses, notes & AI assistant</p>
        </div>

        {/* Form Card */}
        <div className="glass-form-card">
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>Email Address</label>
              <input
                id="student-email"
                name="email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div>
              <label style={styles.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="student-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Your password (min. 6 characters)"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              id="student-login-submit"
              type="submit"
              className="submit-btn"
              disabled={loading}
              style={{ '--accent': accent }}
            >
              {loading ? <span className="spinner" /> : '🔐 Sign In as Student'}
            </button>
          </form>

          <div style={styles.links}>
            <p style={styles.linkText}>
              Don't have an account?{' '}
              <Link to="/register/student" style={{ ...styles.linkA, color: accent }}>Register as Student →</Link>
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={styles.backLink}>← Back to Role Selection</Link>
        </div>
      </div>

      <style>{loginStyles(accent)}</style>
    </div>
  );
};

const loginStyles = (accent) => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

  .glass-form-card {
    background: rgba(52, 52, 64, 0.40);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(70, 69, 84, 0.15);
    border-radius: 2rem;
    padding: 2.5rem;
  }

  .login-input {
    width: 100%;
    padding: 0.875rem 1rem;
    background: #0d0d18;
    border: 1px solid rgba(70, 69, 84, 0.15);
    border-radius: 1rem;
    color: #e3e0f1;
    font-family: 'Inter', sans-serif;
    font-size: 0.925rem;
    outline: none;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .login-input:focus {
    border-color: ${accent};
    box-shadow: 0 0 0 3px ${accent}33;
    background: #292935;
  }

  .login-input::placeholder {
    color: #908fa0;
  }

  .submit-btn {
    width: 100%;
    padding: 0.95rem;
    border: none;
    border-radius: 9999px;
    background: linear-gradient(135deg, ${accent}, ${accent}cc);
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .submit-btn:hover:not(:disabled) {
    box-shadow: 0 8px 32px ${accent}55;
    transform: translateY(-2px);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb: { position: 'fixed', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' },
  container: { position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px' },
  headerSection: { textAlign: 'center', marginBottom: '2rem' },
  iconBox: {
    width: '72px', height: '72px', borderRadius: '1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2.2rem', margin: '0 auto 1rem',
  },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#e3e0f1', marginBottom: '0.25rem', letterSpacing: '-0.02em' },
  subtitle: { color: '#908fa0', fontSize: '1rem', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  label: { display: 'block', marginBottom: '0.5rem', color: '#c7c4d7', fontSize: '0.875rem', fontWeight: '600', fontFamily: "'Inter', sans-serif" },
  eyeBtn: {
    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
  },
  links: { marginTop: '1.5rem', textAlign: 'center' },
  linkText: { color: '#908fa0', fontSize: '0.9rem', margin: '0.25rem 0', fontFamily: "'Inter', sans-serif" },
  linkA: { textDecoration: 'none', fontWeight: '600' },
  backLink: { color: '#908fa0', textDecoration: 'none', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" },
};

export default LoginStudent;
