import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'student') return [
      { to: '/student/dashboard', label: '🏠 Home' },
      { to: '/student/notes', label: '📚 Notes' },
      { to: '/student/mentor', label: '👨‍🏫 Mentors' },
    ];
    if (user.role === 'mentor') return [
      { to: '/mentor/dashboard', label: '🏠 Home' },
      { to: '/mentor/students', label: '👨‍🎓 Students' },
      { to: '/mentor/notes', label: '📄 Notes' },
    ];
    if (user.role === 'admin') return [
      { to: '/admin/panel', label: '🛡️ Admin Panel' },
    ];
    return [];
  };

  return (
    <nav style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎓</div>
        <span style={{ fontSize: '1.1rem', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Student Buddy</span>
      </Link>

      {/* Nav Links */}
      {user && (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {getNavLinks().map((link) => (
            <Link key={link.to} to={link.to} style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500', color: location.pathname === link.to ? '#818cf8' : '#94a3b8', background: location.pathname === link.to ? 'rgba(99,102,241,0.1)' : 'transparent', transition: 'all 0.2s' }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '9999px', padding: '0.35rem 0.875rem 0.35rem 0.375rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', overflow: 'hidden' }}>
                {user.profilePic ? <img src={user.profilePic} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.fullName || user.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>{user.fullName || user.email?.split('@')[0] || 'User'}</span>
            </div>
            <button id="logout-btn" onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '0.625rem', padding: '0.4rem 0.875rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(239,68,68,0.1)'; }}>
              Logout
            </button>
          </>
        )}
        {!user && (
          <button className="btn-primary" onClick={() => navigate('/login')}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
