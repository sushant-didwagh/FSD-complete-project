import React from 'react';
import { useNavigate } from 'react-router-dom';

const StarRating = ({ rating }) => {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: '0.85rem', color: s <= Math.round(rating) ? '#f59e0b' : '#334155' }}>★</span>
      ))}
    </div>
  );
};

const MentorCard = ({ mentor, onBook }) => {
  const { fullName, subjects = [], education, experience, charges, rating, reviews = [], profilePic, _id } = mentor;
  const navigate = useNavigate();

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }} onClick={() => navigate(`/mentor-detail/${_id}`)}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700', flexShrink: 0, overflow: 'hidden' }}>
          {profilePic ? <img src={profilePic} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : fullName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.1rem' }}>{fullName}</h3>
          {education && <p style={{ color: '#64748b', fontSize: '0.8rem' }}>🎓 {education}</p>}
        </div>
      </div>

      {/* Subjects */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {subjects.slice(0, 3).map((s) => (
          <span key={s} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '600' }}>{s}</span>
        ))}
        {subjects.length > 3 && (
          <span style={{ background: 'rgba(100,116,139,0.15)', color: '#64748b', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem' }}>+{subjects.length - 3} more</span>
        )}
      </div>

      {/* Info Row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>⏱️ {experience} yr{experience !== 1 ? 's' : ''}</span>
        <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: '600' }}>₹{charges}/session</span>
      </div>

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <StarRating rating={rating} />
        <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.85rem' }}>{rating?.toFixed(1) || '0.0'}</span>
        <span style={{ color: '#475569', fontSize: '0.78rem' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
      </div>

      {/* Book Button */}
      <button
        id={`book-mentor-${_id}`}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
        onClick={(e) => { e.stopPropagation(); onBook && onBook(mentor); }}
      >
        📅 Book Session
      </button>
    </div>
  );
};

export default MentorCard;
