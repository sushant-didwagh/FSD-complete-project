import React from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NoteCard = ({ note, onDownload, canDownload }) => {
  const { title, subject, uploadedBy, fileSize, originalFileName, createdAt, _id } = note;

  const formattedSize = fileSize ? `${fileSize.toFixed(2)} MB` : 'Unknown';
  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const token = localStorage.getItem('token');

  // Open the file by fetching signed URL
  const handleView = () => {
    const url = `${API_BASE}/api/notes/${_id}/view`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Cannot open file');
        return res.json();
      })
      .then((data) => {
        if (data.url) {
          window.open(data.url, '_blank');
        } else {
          throw new Error('Invalid URL');
        }
      })
      .catch((err) => {
        console.error('View Error:', err);
        alert('Failed to open file. Please try again.');
      });
  };

  const handleDownload = () => {
    if (!canDownload) {
      onDownload && onDownload();
      return;
    }
    const url = `${API_BASE}/api/notes/${_id}/download`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || 'Download failed'); });
        return res.json();
      })
      .then((data) => {
        if (data.url) {
          // Open download URL (Cloudinary will append fl_attachment to force download)
          window.location.href = data.url;
        } else {
          throw new Error('Invalid Download URL');
        }
      })
      .catch((err) => {
        console.error('Download Error:', err);
        alert(err.message || 'Download failed. Please try again.');
      });
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📄 {title}
          </h3>
          <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
            {subject}
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.82rem' }}>
          <span>👤</span>
          <span>By <strong style={{ color: '#94a3b8' }}>{uploadedBy?.fullName || 'Unknown'}</strong>
            {uploadedBy?.role && <span style={{ marginLeft: '0.35rem', fontSize: '0.7rem', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>{uploadedBy.role}</span>}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.82rem' }}>
          <span>📦 {formattedSize}</span>
          <span>🗓️ {formattedDate}</span>
        </div>
        {originalFileName && (
          <div style={{ color: '#475569', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📎 {originalFileName}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <button
          onClick={handleView}
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '0.5rem' }}
        >
          👁️ Read
        </button>
        {canDownload ? (
          <button
            onClick={handleDownload}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '0.5rem' }}
          >
            ⬇️ Download
          </button>
        ) : (
          <button
            onClick={onDownload}
            style={{ flex: 1, padding: '0.5rem', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: '#64748b', borderRadius: '0.75rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
          >
            🔒 Locked
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
