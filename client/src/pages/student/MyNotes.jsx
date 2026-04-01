import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import NoteCard from '../../components/NoteCard';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';

const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [canDownload, setCanDownload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', subject: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchMyNotes(); }, []);

  const fetchMyNotes = async () => {
    setLoading(true);
    try {
      const [notesRes, dlRes] = await Promise.all([
        axiosInstance.get('/api/notes/my'),
        axiosInstance.get('/api/notes/can-download'),
      ]);
      setNotes(notesRes.data.data || []);
      setTotalSize(notesRes.data.totalSizeMB || 0);
      setCanDownload(dlRes.data.canDownload);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.subject) return toast.error('Title and subject are required');
    if (!pdfFile) return toast.error('Please select a PDF file');

    const fd = new FormData();
    fd.append('title', uploadForm.title);
    fd.append('subject', uploadForm.subject);
    fd.append('pdfFile', pdfFile);

    setUploading(true);
    try {
      await axiosInstance.post('/api/notes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Note uploaded successfully! 🎉');
      setShowUpload(false);
      setUploadForm({ title: '', subject: '' });
      setPdfFile(null);
      fetchMyNotes();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await axiosInstance.delete(`/api/notes/${noteId}`);
      toast.success('Note deleted');
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '0.25rem' }}>📚 My Notes</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Total: <strong style={{ color: '#818cf8' }}>{notes.length} notes</strong> · {totalSize.toFixed(2)} MB uploaded
                {!canDownload && <span style={{ color: '#f59e0b' }}> · Upload {(50 - totalSize).toFixed(1)} MB more to unlock downloads</span>}
              </p>
            </div>
            <button id="upload-note-btn" className="btn-primary" onClick={() => setShowUpload(true)}>
              ➕ Upload New Note
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
          ) : notes.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>No notes yet</h3>
              <p>Upload your first note to unlock downloads and help other students!</p>
              <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowUpload(true)}>Upload First Note →</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {notes.map((note) => (
                <div key={note._id} style={{ position: 'relative' }}>
                  <NoteCard note={note} canDownload={canDownload} onDownload={() => toast.error(`Upload ${(50 - totalSize).toFixed(1)} MB more to unlock downloads`)} />
                  <button
                    onClick={() => handleDelete(note._id)}
                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '0.5rem', width: '28px', height: '28px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >🗑️</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '440px', width: '100%' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#e2e8f0' }}>📤 Upload New Note</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="form-label">Title</label><input id="note-title" className="form-input" placeholder="e.g. Data Structures Lecture 3" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} /></div>
              <div><label className="form-label">Subject</label><input id="note-subject" className="form-input" placeholder="e.g. Computer Science" value={uploadForm.subject} onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })} /></div>
              <div>
                <label className="form-label">PDF File</label>
                <div style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('pdf-upload').click()}>
                  <input id="pdf-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setPdfFile(e.target.files[0])} />
                  {pdfFile ? (
                    <p style={{ color: '#10b981', fontWeight: '600' }}>✅ {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                  ) : (
                    <><p style={{ fontSize: '2rem' }}>📄</p><p style={{ color: '#64748b', fontSize: '0.9rem' }}>Click to select PDF</p></>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button id="confirm-upload" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpload} disabled={uploading}>
                  {uploading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '⬆️ Upload'}
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

export default MyNotes;
