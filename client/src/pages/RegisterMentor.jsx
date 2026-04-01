import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const SUBJECTS_LIST = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Data Structures', 'Algorithms', 'Machine Learning', 'Web Development', 'English', 'Economics', 'Accounting', 'History', 'Geography', 'Other'];

const RegisterMentor = () => {
  const [step, setStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [form, setForm] = useState({
    email: '', otp: '', fullName: '', password: '',
    experience: '', university: '', address: '', education: '', charges: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSubject = (s) => {
    setSelectedSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSendOTP = async () => {
    if (!form.email) return toast.error('Enter your email');
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/send-otp', { email: form.email });
      setOtpSent(true);
      toast.success('OTP sent to your email! 📧');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!form.otp) return toast.error('Enter OTP');
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/verify-otp', { email: form.email, otp: form.otp });
      setStep(1);
      toast.success('Email verified! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    const { fullName, password, experience, university, address } = form;
    if (!fullName || !password || !experience || !university || !address) return toast.error('All fields are required');
    if (selectedSubjects.length === 0) return toast.error('Select at least one subject');
    if (!docFile) return toast.error('Upload your document proof (PDF/Image)');

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (!['otp'].includes(k)) formData.append(k, v); });
    formData.append('subjects', selectedSubjects.join(','));
    formData.append('documentProof', docFile);

    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/register/mentor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Registration submitted! ⏳ Await admin approval to login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '560px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem' }}>👨‍🏫</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e2e8f0' }}>Mentor Registration</h1>
          <p style={{ color: '#64748b' }}>Share your expertise with students</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          {['Email Verify', 'Profile Details'].map((s, i) => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= i ? 'linear-gradient(90deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
          ))}
        </div>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0' }}>Step 1: Verify Your Email</h2>
              <div>
                <label className="form-label">Email Address</label>
                <input id="mr-email" name="email" type="email" className="form-input" placeholder="mentor@example.com" value={form.email} onChange={handleChange} disabled={otpSent} />
              </div>
              {!otpSent ? (
                <button className="btn-primary" onClick={handleSendOTP} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '📧 Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="form-label">Enter OTP</label>
                    <input id="mr-otp" name="otp" type="text" className="form-input" placeholder="6-digit OTP" value={form.otp} onChange={handleChange} maxLength={6} />
                  </div>
                  <button className="btn-primary" onClick={handleVerifyOTP} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '✅ Verify & Continue'}
                  </button>
                </>
              )}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0' }}>Step 2: Mentor Profile</h2>
              {[
                { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Dr. Jane Smith' },
                { id: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
                { id: 'university', label: 'University / Institution', type: 'text', placeholder: 'MIT, IIT, etc.' },
                { id: 'education', label: 'Highest Qualification', type: 'text', placeholder: 'Ph.D. Computer Science' },
                { id: 'address', label: 'Address / Location', type: 'text', placeholder: 'City, State' },
              ].map((f) => (
                <div key={f.id}>
                  <label className="form-label">{f.label}</label>
                  <input id={`mr-${f.id}`} name={f.id} type={f.type} className="form-input" placeholder={f.placeholder} value={form[f.id]} onChange={handleChange} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label className="form-label">Experience (Years)</label><input id="mr-experience" name="experience" type="number" min="0" className="form-input" placeholder="5" value={form.experience} onChange={handleChange} /></div>
                <div><label className="form-label">Session Charges (₹)</label><input id="mr-charges" name="charges" type="number" min="0" className="form-input" placeholder="500" value={form.charges} onChange={handleChange} /></div>
              </div>

              <div>
                <label className="form-label">Subjects (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {SUBJECTS_LIST.map((s) => (
                    <button key={s} type="button" onClick={() => toggleSubject(s)} style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600', border: selectedSubjects.includes(s) ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: selectedSubjects.includes(s) ? 'rgba(99,102,241,0.2)' : 'transparent', color: selectedSubjects.includes(s) ? '#818cf8' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Document Proof (PDF / Image)</label>
                <div style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => document.getElementById('docProof').click()}>
                  <input id="docProof" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => setDocFile(e.target.files[0])} />
                  {docFile ? (
                    <p style={{ color: '#10b981', fontWeight: '600' }}>✅ {docFile.name}</p>
                  ) : (
                    <>
                      <p style={{ fontSize: '2rem' }}>📎</p>
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Click to upload PDF or Image</p>
                    </>
                  )}
                </div>
              </div>

              <button id="mentor-register-submit" className="btn-primary" onClick={handleRegister} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '🚀 Submit for Approval'}
              </button>

              <p style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
                ⏳ Your account will be reviewed by an admin before you can login.
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: '600' }}>Sign In →</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterMentor;
