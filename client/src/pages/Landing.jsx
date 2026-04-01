import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '📚',
    title: 'Smart Notes',
    desc: 'Upload, share, and discover study notes. Unlock downloads by contributing your own.',
  },
  {
    icon: '👨‍🏫',
    title: 'Expert Mentors',
    desc: 'Connect with verified mentors. Book sessions, get personalized guidance, and grow faster.',
  },
  {
    icon: '🤖',
    title: 'AI Study Assistant',
    desc: 'Ask any study question and get instant, intelligent answers powered by advanced AI.',
  },
  {
    icon: '💬',
    title: 'Real-time Chat',
    desc: 'Message your mentor directly. Get answers, share resources, and stay connected.',
  },
];

const stats = [
  { value: '500+', label: 'Students' },
  { value: '50+', label: 'Expert Mentors' },
  { value: '1000+', label: 'Notes Shared' },
  { value: '98%', label: 'Satisfaction' },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0a1628 100%)', color: '#e2e8f0' }}>
      {/* ── Background Elements ── */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎓</div>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Student Buddy</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/register/student')}>Get Started →</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '9999px', padding: '0.4rem 1rem', marginBottom: '2rem', fontSize: '0.85rem', color: '#818cf8' }}>
          ✨ The all-in-one learning platform
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Learn Smarter,<br />
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Faster</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.7 }}>
          Connect with expert mentors, share and discover study notes, and get instant AI-powered answers to any academic question.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }} onClick={() => navigate('/register/student')}>
            🎓 Join as Student
          </button>
          <button className="btn-secondary" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }} onClick={() => navigate('/register/mentor')}>
            👨‍🏫 Become a Mentor
          </button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {stats.map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.75rem' }}>Everything You Need to Excel</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '1rem' }}>Powerful tools designed for students and mentors</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {features.map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#e2e8f0' }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.5rem', padding: '4rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Ready to Transform Your Learning?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Join thousands of students and mentors already using Student Buddy</p>
          <button className="btn-primary" style={{ padding: '0.875rem 3rem', fontSize: '1.1rem' }} onClick={() => navigate('/register/student')}>
            Get Started for Free →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🎓</span>
          <strong style={{ color: '#64748b' }}>Student Buddy</strong>
        </div>
        <p>© 2026 Student Buddy. Built for learners, by learners.</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          {['Help', 'Contact', 'Home', 'Privacy'].map((l) => (
            <a key={l} href="#" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#6366f1'}
              onMouseLeave={(e) => e.target.style.color = '#475569'}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Landing;
