import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';

const MentorStudents = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('approved');
  const navigate = useNavigate();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/api/mentorship/requests');
      setRequests(data.data || []);
    } catch { toast.error('Failed to load student data'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/api/mentorship/${id}/status`, { status });
      toast.success(`Session marked as ${status} ✅`);
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = requests.filter((r) => r.status === tab);

  const tabs = [
    { id: 'pending', label: '⏳ Requests', color: '#f59e0b' },
    { id: 'approved', label: '✅ Active', color: '#10b981' },
    { id: 'completed', label: '📜 Completed', color: '#6366f1' },
    { id: 'rejected', label: '❌ Rejected', color: '#ef4444' },
  ];

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '0.25rem' }}>👨‍🎓 My Students</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {requests.filter((r) => r.status === 'approved').length} active ·{' '}
              {requests.filter((r) => r.status === 'pending').length} pending requests
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.2s',
                  background: tab === t.id ? t.color + '22' : 'rgba(255,255,255,0.05)',
                  color: tab === t.id ? t.color : '#64748b',
                  border: tab === t.id ? `1px solid ${t.color}44` : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {t.label} ({requests.filter((r) => r.status === t.id).length})
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤷</div>
              <p>No {tab} students found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((r) => (
                <div key={r._id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '800', flexShrink: 0, overflow: 'hidden' }}>
                      {r.studentId?.profilePic
                        ? <img src={r.studentId.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : r.studentId?.fullName?.[0]?.toUpperCase()}
                    </div>

                    {/* Student Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.2rem' }}>{r.studentId?.fullName}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.83rem', marginBottom: '0.25rem' }}>{r.studentId?.email}</p>
                      {r.studentId?.university && (
                        <p style={{ color: '#475569', fontSize: '0.8rem' }}>🏫 {r.studentId.university}</p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.83rem', color: '#64748b', marginTop: '0.375rem' }}>
                        <span>📚 {r.subject}</span>
                        <span>🗓️ {r.month}</span>
                        <span>⏰ {r.timeSlot}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {tab === 'pending' && (
                        <>
                          <button id={`approve-student-${r._id}`} className="btn-success" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }} onClick={() => updateStatus(r._id, 'approved')}>✅ Approve</button>
                          <button id={`reject-student-${r._id}`} className="btn-danger" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }} onClick={() => updateStatus(r._id, 'rejected')}>❌ Reject</button>
                        </>
                      )}
                      {tab === 'approved' && (
                        <>
                          <button
                            id={`chat-student-${r._id}`}
                            className="btn-primary"
                            style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
                            onClick={() => navigate(`/mentor/chat/${r.studentId?._id}`)}
                          >💬 Chat</button>
                          <button className="btn-success" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }} onClick={() => updateStatus(r._id, 'completed')}>✅ Complete</button>
                        </>
                      )}
                      {tab === 'completed' && (
                        <span className="badge badge-completed">Session Done</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MentorStudents;
