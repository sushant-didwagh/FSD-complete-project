import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const studentLinks = [
  { to: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/student/notes', icon: '📚', label: 'My Notes' },
  { to: '/student/mentor', icon: '👨‍🏫', label: 'My Mentor' },
  { to: 'https://aak007-studentchatbot.hf.space/', icon: '🤖', label: 'Ask AI', external: true },
];

const mentorLinks = [
  { to: '/mentor/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/mentor/students', icon: '👨‍🎓', label: 'Students' },
  { to: '/mentor/notes', icon: '📄', label: 'Upload Notes' },
  { to: '/mentor/profile', icon: '✏️', label: 'Edit Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'student' ? studentLinks : mentorLinks;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <aside style={{ width: '240px', minHeight: '100vh', background: 'rgba(26,26,46,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
      {/* User Info */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.875rem', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700', margin: '0 auto 0.5rem', overflow: 'hidden' }}>
          {user?.profilePic ? <img src={user.profilePic} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.fullName || user?.email || 'U')[0].toUpperCase()}
        </div>
        <p style={{ fontSize: '1rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.1rem' }}>{user?.fullName || user?.email?.split('@')[0] || 'User'}</p>
        <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: '600', textTransform: 'uppercase' }}>{user?.role}</span>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map((link) => (
          link.external ? (
            <a
              key={link.to}
              href={link.to}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-link"
            >
              <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
              {link.label}
            </a>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
              {link.label}
            </NavLink>
          )
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', marginTop: '0.5rem', width: '100%' }}>
        🚪 Logout
      </button>
    </aside>
  );
};

export default Sidebar;
