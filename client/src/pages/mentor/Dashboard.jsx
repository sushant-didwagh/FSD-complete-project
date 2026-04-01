import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const STATUS_LABELS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', completed: 'badge-completed' };

const MentorDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/api/mentorship/requests');
      setRequests(data.data || []);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/api/mentorship/${id}/status`, { status });
      toast.success(`Session ${status} ✅`);
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const today = requests.filter((r) => r.status === 'approved');
  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          {/* Hero */}
          <section style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '1.25rem', padding: '2rem', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Welcome, <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.fullName?.split(' ')[0]}</span>! 👨‍🏫
            </h1>
            <p style={{ color: '#94a3b8' }}>You have <strong style={{ color: '#10b981' }}>{today.length}</strong> active sessions and <strong style={{ color: '#f59e0b' }}>{pending.length}</strong> pending requests.</p>
          </section>

          {/* Today's Sessions */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1rem' }}>🗓️ Active Sessions</h2>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div> :
            today.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No active sessions yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {today.map((r) => (
                  <div key={r._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem', flexShrink: 0 }}>{r.studentId?.fullName?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '0.95rem' }}>{r.studentId?.fullName}</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span>📚 {r.subject}</span>
                        <span>⏰ {r.timeSlot}</span>
                        <span>🗓️ {r.month}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} onClick={() => navigate(`/mentor/chat/${r.studentId?._id}`)}>💬 Chat</button>
                      <button className="btn-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} onClick={() => updateStatus(r._id, 'completed')}>✅ Complete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Requests */}
          <section>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1rem' }}>⏳ Pending Requests</h2>
            {pending.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No pending requests</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pending.map((r) => (
                  <div key={r._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#f59e0b', flexShrink: 0 }}>{r.studentId?.fullName?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', color: '#e2e8f0' }}>{r.studentId?.fullName}</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span>📚 {r.subject}</span>
                        <span>⏰ {r.timeSlot}</span>
                        <span>🗓️ {r.month}</span>
                      </div>
                      {r.studentId?.university && <p style={{ color: '#475569', fontSize: '0.8rem' }}>🏫 {r.studentId.university}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }} onClick={() => updateStatus(r._id, 'approved')}>✅ Approve</button>
                      <button className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }} onClick={() => updateStatus(r._id, 'rejected')}>❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MentorDashboard;
