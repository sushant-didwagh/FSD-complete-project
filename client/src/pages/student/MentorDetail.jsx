import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ fontSize: '1rem', color: s <= Math.round(rating) ? '#f59e0b' : '#334155' }}>★</span>
    ))}
  </div>
);

const MentorDetail = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookForm, setBookForm] = useState({ subject: '', month: '', timeSlot: '' });
  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/api/mentors/${mentorId}`)
      .then(({ data }) => setMentor(data.data))
      .catch(() => { toast.error('Mentor not found'); navigate('/student/dashboard'); })
      .finally(() => setLoading(false));
  }, [mentorId]);

  const handleBook = async () => {
    if (!bookForm.subject || !bookForm.month || !bookForm.timeSlot)
      return toast.error('All booking fields are required');
    setBooking(true);
    try {
      await axiosInstance.post('/api/mentorship/request', { mentorId, ...bookForm });
      toast.success('Booking request sent! ✅ Check My Mentor page for updates.');
      setShowBooking(false);
      setBookForm({ subject: '', month: '', timeSlot: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  const handleReview = async () => {
    if (!reviewForm.comment) return toast.error('Please write a comment');
    setSubmittingReview(true);
    try {
      await axiosInstance.post(`/api/mentors/${mentorId}/review`, reviewForm);
      toast.success('Review submitted! ⭐');
      // Refresh mentor info
      const { data } = await axiosInstance.get(`/api/mentors/${mentorId}`);
      setMentor(data.data);
      setReviewForm({ comment: '', rating: 5 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (!mentor) return null;

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          {/* Back button */}
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.875rem', padding: '0.4rem 1rem' }}>
            ← Back
          </button>

          {/* Mentor Profile Card */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', flexShrink: 0, overflow: 'hidden' }}>
                {mentor.profilePic
                  ? <img src={mentor.profilePic} alt={mentor.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : mentor.fullName?.[0]?.toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '0.25rem' }}>{mentor.fullName}</h1>
                {mentor.education && <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>🎓 {mentor.education}</p>}
                {mentor.university && <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>🏫 {mentor.university}</p>}
                {mentor.address && <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>📍 {mentor.address}</p>}

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#6366f1' }}>{mentor.experience}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Years Exp.</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>₹{mentor.charges}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>/ session</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>{mentor.rating?.toFixed(1) || '0.0'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Rating</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8b5cf6' }}>{mentor.reviews?.length || 0}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Reviews</p>
                  </div>
                </div>

                {/* Subjects */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {mentor.subjects?.map((s) => (
                    <span key={s} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <div>
                <button
                  id="book-now-btn"
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}
                  onClick={() => setShowBooking(true)}
                >
                  📅 Book Session
                </button>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          {showBooking && (
            <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.3)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1.25rem' }}>📅 Book a Session with {mentor.fullName}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">Subject</label>
                  <input id="detail-book-subject" className="form-input" placeholder="e.g. Mathematics" value={bookForm.subject} onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Month</label>
                  <input id="detail-book-month" className="form-input" placeholder="e.g. April 2026" value={bookForm.month} onChange={(e) => setBookForm({ ...bookForm, month: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Preferred Time Slot</label>
                  <input id="detail-book-slot" className="form-input" placeholder="e.g. Mon/Wed, 6–7 PM" value={bookForm.timeSlot} onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn-primary" onClick={handleBook} disabled={booking} style={{ padding: '0.625rem 1.5rem' }}>
                  {booking ? <span className="spinner" style={{ width: '1.1rem', height: '1.1rem', borderWidth: '2px' }} /> : 'Send Request'}
                </button>
                <button className="btn-secondary" onClick={() => setShowBooking(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Existing Reviews */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1rem' }}>
                ⭐ Reviews ({mentor.reviews?.length || 0})
              </h2>
              {mentor.reviews?.length === 0 ? (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p>No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {mentor.reviews?.map((r, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <StarRating rating={r.rating} />
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.rating}/5</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1rem' }}>✍️ Write a Review</h2>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: s <= reviewForm.rating ? '#f59e0b' : '#334155', transition: 'all 0.15s' }}>★</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Comment</label>
                  <textarea
                    id="review-comment"
                    className="form-input"
                    placeholder="Share your experience with this mentor..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button id="submit-review" className="btn-primary" onClick={handleReview} disabled={submittingReview} style={{ width: '100%', justifyContent: 'center' }}>
                  {submittingReview ? <span className="spinner" style={{ width: '1.1rem', height: '1.1rem', borderWidth: '2px' }} /> : '⭐ Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MentorDetail;
