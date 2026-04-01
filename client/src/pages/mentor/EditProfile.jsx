import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const SUBJECTS_LIST = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Data Structures', 'Algorithms', 'Machine Learning', 'Web Development',
  'English', 'Economics', 'Accounting', 'History', 'Geography', 'Other',
];

const MentorEditProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    education: user?.education || '',
    university: user?.university || '',
    address: user?.address || '',
    experience: user?.experience || '',
    charges: user?.charges || '',
  });
  const [selectedSubjects, setSelectedSubjects] = useState(user?.subjects || []);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePic || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSubject = (s) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      fd.append('subjects', selectedSubjects.join(','));
      if (profilePicFile) fd.append('profilePic', profilePicFile);

      const { data } = await axiosInstance.put('/api/mentors/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(data.data);
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '0.25rem' }}>✏️ Edit Profile</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Update your mentor profile information</p>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Profile Picture */}
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1rem', cursor: 'pointer' }} onClick={() => document.getElementById('profile-pic-input').click()}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', overflow: 'hidden', border: '3px solid rgba(99,102,241,0.4)' }}>
                  {previewUrl
                    ? <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user?.fullName?.[0]?.toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '2px solid #0f0f1a' }}>📷</div>
              </div>
              <input id="profile-pic-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              <p style={{ fontWeight: '700', color: '#e2e8f0', marginBottom: '0.25rem' }}>{user?.fullName}</p>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{user?.email}</p>
              <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>MENTOR</span>
              <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: '1rem' }}>Click photo to change</p>
            </div>

            {/* Form Fields */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {[
                  { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                  { id: 'education', label: 'Highest Qualification', type: 'text', placeholder: 'Ph.D. / M.Tech / B.E.' },
                  { id: 'university', label: 'University / Institution', type: 'text', placeholder: 'Your institution' },
                  { id: 'address', label: 'Location / Address', type: 'text', placeholder: 'City, State' },
                  { id: 'experience', label: 'Experience (Years)', type: 'number', placeholder: '5' },
                  { id: 'charges', label: 'Session Charges (₹)', type: 'number', placeholder: '500' },
                ].map((f) => (
                  <div key={f.id}>
                    <label className="form-label">{f.label}</label>
                    <input id={`ep-${f.id}`} name={f.id} type={f.type} className="form-input" placeholder={f.placeholder} value={form[f.id]} onChange={handleChange} />
                  </div>
                ))}
              </div>

              {/* Subjects */}
              <div style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Subjects (click to toggle)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {SUBJECTS_LIST.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      style={{
                        padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600',
                        cursor: 'pointer', transition: 'all 0.2s',
                        border: selectedSubjects.includes(s) ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                        background: selectedSubjects.includes(s) ? 'rgba(99,102,241,0.2)' : 'transparent',
                        color: selectedSubjects.includes(s) ? '#818cf8' : '#64748b',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                id="save-profile-btn"
                className="btn-primary"
                onClick={handleSave}
                disabled={loading}
                style={{ marginTop: '2rem', padding: '0.75rem 2.5rem' }}
              >
                {loading ? <span className="spinner" style={{ width: '1.1rem', height: '1.1rem', borderWidth: '2px' }} /> : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MentorEditProfile;
