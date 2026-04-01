import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import NoteCard from '../../components/NoteCard';
import MentorCard from '../../components/MentorCard';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [canDownload, setCanDownload] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [noteFilter, setNoteFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookForm, setBookForm] = useState({ subject: '', month: '', timeSlot: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notesRes, mentorsRes, dlRes] = await Promise.all([
        axiosInstance.get('/api/notes?limit=6'),
        axiosInstance.get('/api/mentors'),
        axiosInstance.get('/api/notes/can-download'),
      ]);
      setNotes(notesRes.data.data || []);
      setMentors(mentorsRes.data.data || []);
      setCanDownload(dlRes.data.canDownload);
      setTotalSize(dlRes.data.totalSizeMB);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const searchNotes = async (keyword) => {
    try {
      const { data } = await axiosInstance.get(`/api/notes?keyword=${keyword}&limit=6`);
      setNotes(data.data || []);
    } catch { toast.error('Search failed'); }
  };

  const handleBook = async () => {
    if (!bookForm.subject || !bookForm.month || !bookForm.timeSlot) return toast.error('All booking fields required');
    try {
      await axiosInstance.post('/api/mentorship/request', { mentorId: selectedMentor._id, ...bookForm });
      toast.success('Booking request sent! ✅');
      setShowBookModal(false);
      setBookForm({ subject: '', month: '', timeSlot: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          {/* Hero */}
          <section style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '1.25rem', padding: '2.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Welcome back, <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}</span>! 👋
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '500px' }}>
              Your learning journey continues. Explore notes, connect with mentors, and ask the AI anything.
            </p>

            {/* Download progress bar */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', padding: '1rem', maxWidth: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Download Access</span>
                <span style={{ color: canDownload ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                  {canDownload ? '🔓 Unlocked' : `${totalSize.toFixed(1)}/50 MB`}
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((totalSize / 50) * 100, 100)}%`, height: '100%', background: canDownload ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/student/notes" className="btn-primary">📚 My Notes</Link>
              <Link to="/student/ask-ai" className="btn-secondary">🤖 Ask AI</Link>
            </div>
          </section>

          {/* Notes Section */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#e2e8f0' }}>📄 Latest Notes</h2>
              <input
                id="note-search"
                className="form-input"
                placeholder="🔍 Search notes..."
                value={noteFilter}
                onChange={(e) => { setNoteFilter(e.target.value); searchNotes(e.target.value); }}
                style={{ width: '220px' }}
              />
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
            ) : notes.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>No notes found. Be the first to upload!</p>
                <Link to="/student/notes" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Upload Notes →</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {notes.map((note) => (
                  <NoteCard key={note._id} note={note} canDownload={canDownload} onDownload={() => toast.error(`Upload ${(50 - totalSize).toFixed(1)} MB more to unlock downloads 🔒`)} />
                ))}
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/student/notes" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>View all notes →</Link>
            </div>
          </section>

          {/* Mentors Section */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1rem' }}>👨‍🏫 Top Mentors</h2>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
            ) : mentors.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👻</div>
                <p>No mentors available yet. Check back soon!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {mentors.slice(0, 6).map((mentor) => (
                  <MentorCard key={mentor._id} mentor={mentor} onBook={(m) => { setSelectedMentor(m); setShowBookModal(true); }} />
                ))}
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/student/mentor" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>View all mentors →</Link>
            </div>
          </section>
        </main>
      </div>

      {/* Booking Modal */}
      {showBookModal && selectedMentor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '440px', width: '100%' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#e2e8f0' }}>
              📅 Book Session with {selectedMentor.fullName}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Subject</label>
                <input id="book-subject" className="form-input" placeholder="e.g. Mathematics" value={bookForm.subject} onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Month</label>
                <input id="book-month" className="form-input" placeholder="e.g. April 2026" value={bookForm.month} onChange={(e) => setBookForm({ ...bookForm, month: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Time Slot</label>
                <input id="book-slot" className="form-input" placeholder="e.g. Mon, Wed 6PM - 7PM" value={bookForm.timeSlot} onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleBook}>Send Request</button>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowBookModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default StudentDashboard;
