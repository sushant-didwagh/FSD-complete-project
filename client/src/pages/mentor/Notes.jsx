import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import NoteCard from '../../components/NoteCard';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';

const MentorNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', subject: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      const { data } = await axiosInstance.get('/api/notes/my');
      setNotes(data.data || []);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.subject || !pdfFile) return toast.error('All fields required');
    const fd = new FormData();
    fd.append('title', uploadForm.title);
    fd.append('subject', uploadForm.subject);
    fd.append('pdfFile', pdfFile);
    setUploading(true);
    try {
      await axiosInstance.post('/api/notes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Note uploaded! 🎉');
      setShowUpload(false);
      setUploadForm({ title: '', subject: '' });
      setPdfFile(null);
      fetchNotes();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e2e8f0' }}>📄 Upload Notes</h1>
            <button id="mentor-upload-btn" className="btn-primary" onClick={() => setShowUpload(true)}>➕ Add Note</button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
          ) : notes.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
              <p>No notes uploaded yet. Share your knowledge with students!</p>
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowUpload(true)}>Upload First Note</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {notes.map((n) => <NoteCard key={n._id} note={n} canDownload={true} />)}
            </div>
          )}
        </main>
      </div>

      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '440px', width: '100%' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#e2e8f0' }}>📤 Upload Note</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="form-label">Title</label><input className="form-input" placeholder="Lecture title..." value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} /></div>
              <div><label className="form-label">Subject</label><input className="form-input" placeholder="Subject area..." value={uploadForm.subject} onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })} /></div>
              <div>
                <label className="form-label">PDF File</label>
                <div style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('m-pdf').click()}>
                  <input id="m-pdf" type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setPdfFile(e.target.files[0])} />
                  {pdfFile ? <p style={{ color: '#10b981' }}>✅ {pdfFile.name}</p> : <><p style={{ fontSize: '2rem' }}>📄</p><p style={{ color: '#64748b' }}>Click to select PDF</p></>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpload} disabled={uploading}>
                  {uploading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : 'Upload'}
                </button>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowUpload(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MentorNotes;
