import React from 'react';

const Footer = () => (
  <footer style={{ background: 'rgba(15,15,26,0.9)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem', textAlign: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
      <span style={{ fontSize: '1.2rem' }}>🎓</span>
      <span style={{ fontWeight: '800', color: '#94a3b8' }}>Student Buddy</span>
    </div>
    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
      {['Help', 'Contact', 'Home', 'Privacy', 'Terms'].map((l) => (
        <a key={l} href="#" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.target.style.color = '#6366f1'}
          onMouseLeave={(e) => e.target.style.color = '#475569'}>{l}</a>
      ))}
    </div>
    <p style={{ color: '#334155', fontSize: '0.8rem' }}>© 2026 Student Buddy. All rights reserved.</p>
  </footer>
);

export default Footer;
