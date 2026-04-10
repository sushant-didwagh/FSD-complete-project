import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const roles = [
  {
    key: 'student',
    icon: '👨‍🎓',
    title: 'Student',
    subtitle: 'Access courses, notes, mentors & AI assistant',
    accent: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.25)',
    path: '/login/student',
  },
  {
    key: 'mentor',
    icon: '👨‍🏫',
    title: 'Mentor',
    subtitle: 'Manage students, upload notes & chat',
    accent: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.25)',
    path: '/login/mentor',
  },
  {
    key: 'admin',
    icon: '🛡️',
    title: 'Admin',
    subtitle: 'Approve mentors & manage platform',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    path: '/login/admin',
  },
];

const LoginSelect = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Decorative orbs */}
      <div style={{ ...styles.orb, top: '10%', left: '15%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
      <div style={{ ...styles.orb, bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
      <div style={{ ...styles.orb, top: '50%', left: '60%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🎓</div>
          <h1 style={styles.heading}>Welcome to Student Buddy</h1>
          <p style={styles.subtitle}>Choose your role to sign in</p>
        </div>

        {/* Role Cards */}
        <div style={styles.cardsContainer}>
          {roles.map((role) => (
            <RoleCard key={role.key} role={role} onClick={() => navigate(role.path)} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/" style={styles.backLink}>← Back to Home</Link>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        .role-card {
          background: rgba(52, 52, 64, 0.40);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(70, 69, 84, 0.15);
          border-radius: 2rem;
          padding: 2.5rem 2rem;
          width: 300px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 2rem;
          padding: 2px;
          background: linear-gradient(135deg, var(--accent) 0%, transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .role-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px var(--glow);
        }

        .role-card:hover::before {
          opacity: 1;
        }

        .role-card-icon {
          width: 80px;
          height: 80px;
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .role-card:hover .role-card-icon {
          transform: scale(1.1);
          box-shadow: 0 8px 32px var(--glow);
        }

        .role-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #ffffff;
          margin-top: 0.5rem;
        }

        .role-card-btn:hover {
          transform: translateX(4px);
        }

        @media (max-width: 1000px) {
          .cards-container {
            flex-direction: column !important;
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
};

const RoleCard = ({ role, onClick }) => (
  <div
    className="role-card"
    style={{ '--accent': role.accent, '--glow': role.glow }}
    onClick={onClick}
  >
    <div
      className="role-card-icon"
      style={{ background: `linear-gradient(135deg, ${role.accent}33, ${role.accent}11)` }}
    >
      {role.icon}
    </div>
    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#e3e0f1', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {role.title}
    </h2>
    <p style={{ fontSize: '0.9rem', color: '#c7c4d7', margin: 0, lineHeight: '1.5', fontFamily: "'Inter', sans-serif" }}>
      {role.subtitle}
    </p>
    <button className="role-card-btn" style={{ background: `linear-gradient(135deg, ${role.accent}, ${role.accent}cc)` }}>
      Sign In <span style={{ fontSize: '1.1rem' }}>→</span>
    </button>
  </div>
);

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
  orb: {
    position: 'fixed',
    borderRadius: '50%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '1100px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  logo: {
    width: '72px',
    height: '72px',
    borderRadius: '1.25rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.2rem',
    margin: '0 auto 1.25rem',
    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#e3e0f1',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#908fa0',
    fontSize: '1.1rem',
    margin: 0,
  },
  cardsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  backLink: {
    color: '#908fa0',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    transition: 'color 0.3s',
  },
};

export default LoginSelect;
