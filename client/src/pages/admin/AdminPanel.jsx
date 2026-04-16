import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pending'); // pending, students, mentors
  const [pendingMentors, setPendingMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [approvedMentors, setApprovedMentors] = useState([]);
  const [stats, setStats] = useState({ students: 0, mentors: 0, pendingMentors: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, studentsRes, mentorsRes] = await Promise.all([
        axiosInstance.get('/api/admin/stats'),
        axiosInstance.get('/api/admin/mentors/pending'),
        axiosInstance.get('/api/admin/students'),
        axiosInstance.get('/api/admin/mentors'),
      ]);
      setStats(statsRes.data.data || {});
      setPendingMentors(pendingRes.data.data || []);
      setStudents(studentsRes.data.data || []);
      setApprovedMentors(mentorsRes.data.data || []);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await axiosInstance.put(`/api/admin/mentors/${id}/${action}`);
      toast.success(`Mentor ${action}d successfully! ${action === 'approve' ? '✅' : '❌'}`);
      
      // Refresh data
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(null); }
  };

  const handleDeleteUser = async (id, role) => {
    if(!window.confirm(`Are you sure you want to delete this ${role}? This cannot be undone.`)) return;
    
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`);
      toast.success(`${role} deleted successfully`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleViewDoc = (mentorId) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE}/api/admin/mentors/${mentorId}/document`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Cannot open document');
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      })
      .catch(() => alert('Failed to open document. Please try again.'));
  };

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: '👨‍🎓', color: '#6366f1' },
    { label: 'Active Mentors', value: stats.mentors, icon: '👨‍🏫', color: '#10b981' },
    { label: 'Pending Reviews', value: stats.pendingMentors, icon: '⏳', color: '#f59e0b' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="page-container">
        
        {/* Admin Sidebar */}
        <aside style={{ width: '240px', background: 'rgba(26,26,46,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
          <div style={{ padding: '0 0.5rem 1rem 0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🛡️ Admin Dashboard
            </h2>
          </div>
          
          {[
            { id: 'pending', label: 'Pending Approvals', icon: '⏳', count: stats.pendingMentors },
            { id: 'students', label: 'All Students', icon: '👨‍🎓', count: stats.students },
            { id: 'mentors', label: 'Active Mentors', icon: '👨‍🏫', count: stats.mentors }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'sidebar-link active' : 'sidebar-link'}
              style={{ border: 'none', background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'transparent', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: activeTab === tab.id ? '#818cf8' : '#94a3b8', fontWeight: activeTab === tab.id ? '600' : '500', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                {tab.label}
              </div>
              {tab.count > 0 && (
                <span style={{ background: activeTab === tab.id ? '#6366f1' : 'rgba(255,255,255,0.1)', color: activeTab === tab.id ? '#fff' : '#cbd5e1', padding: '0.1rem 0.4rem', borderRadius: '5px', fontSize: '0.7rem' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="main-content" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '0.25rem' }}>System Overview</h1>
            <p style={{ color: '#64748b' }}>Manage mentor approvals and platform participants</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {statCards.map((s) => (
              <div key={s.label} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: '1.75rem', fontWeight: '800', color: s.color }}>{loading ? '...' : s.value}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeTab === 'pending' && '⏳ Pending Mentor Approvals'}
              {activeTab === 'students' && '👨‍🎓 Registered Students'}
              {activeTab === 'mentors' && '👨‍🏫 Active Mentors'}
            </h2>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
            ) : (
              <>
                {/* PENDING MENTORS TAB */}
                {activeTab === 'pending' && (
                  pendingMentors.length === 0 ? (
                    <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                      <h3 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>No pending approvals!</h3>
                      <p>You are all caught up.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {pendingMentors.map((mentor) => (
                        <div key={mentor._id} className="glass-card" style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '700', flexShrink: 0 }}>
                              {mentor.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.25rem' }}>{mentor.fullName}</h3>
                              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{mentor.email}</p>
                              
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                {mentor.subjects?.map((s) => (
                                  <span key={s} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '600' }}>{s}</span>
                                ))}
                              </div>
                              
                              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.83rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                {mentor.education && <span><strong>Education:</strong> {mentor.education}</span>}
                                {mentor.experience !== undefined && <span><strong>Experience:</strong> {mentor.experience} year(s)</span>}
                                {mentor.university && <span><strong>University:</strong> {mentor.university}</span>}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                              <button onClick={() => handleViewDoc(mentor._id)} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', width: '100%', justifyContent: 'center' }}>
                                📄 View Document Proof
                              </button>
                              
                              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <button
                                  className="btn-success"
                                  onClick={() => handleAction(mentor._id, 'approve')}
                                  disabled={actionLoading === mentor._id + 'approve'}
                                  style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem', justifyContent: 'center' }}
                                >
                                  {actionLoading === mentor._id + 'approve' ? '...' : '✅ Approve'}
                                </button>
                                <button
                                  className="btn-danger"
                                  onClick={() => handleAction(mentor._id, 'reject')}
                                  disabled={actionLoading === mentor._id + 'reject'}
                                  style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem', justifyContent: 'center' }}
                                >
                                  {actionLoading === mentor._id + 'reject' ? '...' : '❌ Reject'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* STUDENTS TAB */}
                {activeTab === 'students' && (
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <tr>
                          <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Name & Email</th>
                          <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>University</th>
                          <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Joined</th>
                          <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(student => (
                          <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: '600', color: '#e2e8f0' }}>{student.fullName}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.email}</div>
                            </td>
                            <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>{student.university || 'N/A'}</td>
                            <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{new Date(student.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button onClick={() => handleDeleteUser(student._id, 'student')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '0.4rem 0.75rem', borderRadius: '0.375rem' }} onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* APPROVED MENTORS TAB */}
                {activeTab === 'mentors' && (
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <tr>
                          <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Name & Email</th>
                          <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Subjects</th>
                          <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Rating</th>
                          <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedMentors.map(mentor => (
                          <tr key={mentor._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: '600', color: '#e2e8f0' }}>{mentor.fullName}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{mentor.email}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                {mentor.subjects?.slice(0, 2).map((s) => (
                                  <span key={s} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>{s}</span>
                                ))}
                                {mentor.subjects?.length > 2 && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>+{mentor.subjects.length - 2}</span>}
                              </div>
                            </td>
                            <td style={{ padding: '1rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 'bold' }}>
                              ⭐ {mentor.rating ? mentor.rating.toFixed(1) : 'New'}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button onClick={() => handleDeleteUser(mentor._id, 'mentor')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '0.4rem 0.75rem', borderRadius: '0.375rem' }} onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;
