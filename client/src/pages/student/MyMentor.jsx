import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', completed: 'badge-completed' };

const MyMentor = () => {
  const [mentorships, setMentorships] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('current');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/api/mentorship/my'),
      axiosInstance.get('/api/mentors'),
    ]).then(([msRes, mRes]) => {
      setMentorships(msRes.data.data || []);
      setMentors(mRes.data.data || []);
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false));
  }, []);

  const filtered = mentorships.filter((m) => {
    if (tab === 'current') return m.status === 'approved';
    if (tab === 'pending') return m.status === 'pending';
    if (tab === 'history') return ['completed', 'rejected'].includes(m.status);
    return true;
  });

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '1.5rem' }}>👨‍🏫 My Mentor</h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.375rem', borderRadius: '0.875rem', width: 'fit-content' }}>
            {[{ id: 'current', label: '✅ Current' }, { id: 'pending', label: '⏳ Pending' }, { id: 'history', label: '📜 History' }].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', background: tab === t.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent', color: tab === t.id ? 'white' : '#64748b', transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🤷</div>
              <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>No {tab} mentorships</p>
              {tab !== 'history' && <p>Go to Dashboard to browse and book mentors</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((ms) => (
                <div key={ms._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '700', flexShrink: 0, overflow: 'hidden' }}>
                    {ms.mentorId?.profilePic ? <img src={ms.mentorId.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ms.mentorId?.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontWeight: '700', color: '#e2e8f0', marginBottom: '0.25rem' }}>{ms.mentorId?.fullName}</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>📚 {ms.subject}</span>
                      <span>🗓️ {ms.month}</span>
                      <span>⏰ {ms.timeSlot}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${STATUS_COLORS[ms.status] || ''}`}>{ms.status}</span>
                    {ms.status === 'approved' && (
                      <button className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.82rem' }} onClick={() => navigate(`/student/chat/${ms.mentorId?._id}`)}>
                        💬 Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Browse Mentors */}
          {mentors.length > 0 && mentorships.length === 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1rem' }}>🔍 Browse Available Mentors</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {mentors.slice(0, 3).map((m) => (
                  <div key={m._id} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{m.fullName?.[0]}</div>
                      <div>
                        <p style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '0.9rem' }}>{m.fullName}</p>
                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{m.subjects?.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MyMentor;
