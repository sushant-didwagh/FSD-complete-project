import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Email & OTP', 'Your Details'];

const RegisterStudent = () => {
  const [step, setStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', otp: '', fullName: '', password: '', confirmPassword: '',
    university: '', admissionYear: '', passingYear: '',
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOTP = async () => {
    if (!form.email) return toast.error('Enter your email first');
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/send-otp', { email: form.email });
      setOtpSent(true);
      toast.success('OTP sent! Check your email 📧');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!form.otp) return toast.error('Enter the OTP');
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/verify-otp', { email: form.email, otp: form.otp });
      setOtpVerified(true);
      setStep(1);
      toast.success('OTP verified! ✅ Fill in your details.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const { fullName, password, confirmPassword, university, admissionYear, passingYear } = form;
    if (!fullName || !password || !confirmPassword || !university || !admissionYear || !passingYear) {
      return toast.error('All fields are required');
    }
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/auth/register/student', {
        fullName, email: form.email, password, confirmPassword,
        university, admissionYear: Number(admissionYear), passingYear: Number(passingYear),
      });
      const { token, ...userData } = data.data;
      login(userData, token);
      toast.success(`Welcome to Student Buddy, ${userData.fullName}! 🎉`);
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'fixed', top: '30%', right: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem' }}>🎓</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '0.25rem' }}>Student Registration</h1>
          <p style={{ color: '#64748b' }}>Create your Student Buddy account</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= i ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
          ))}
        </div>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0' }}>Step 1: Verify Your Email</h2>
              <div>
                <label className="form-label">Email Address</label>
                <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} disabled={otpSent} />
              </div>
              {!otpSent ? (
                <button className="btn-primary" onClick={handleSendOTP} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '📧 Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="form-label">Enter OTP (sent to your email)</label>
                    <input id="otp-input" name="otp" type="text" className="form-input" placeholder="6-digit OTP" value={form.otp} onChange={handleChange} maxLength={6} />
                  </div>
                  <button className="btn-primary" onClick={handleVerifyOTP} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '✅ Verify OTP'}
                  </button>
                  <button className="btn-secondary" onClick={handleSendOTP} disabled={loading} style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0' }}>Step 2: Your Details</h2>
              {[
                { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                { id: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
                { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
                { id: 'university', label: 'University / College', type: 'text', placeholder: 'MIT, Stanford, etc.' },
              ].map((f) => (
                <div key={f.id}>
                  <label className="form-label">{f.label}</label>
                  <input id={`sr-${f.id}`} name={f.id} type={f.type} className="form-input" placeholder={f.placeholder} value={form[f.id]} onChange={handleChange} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Admission Year</label>
                  <input id="sr-admissionYear" name="admissionYear" type="number" className="form-input" placeholder="2022" value={form.admissionYear} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">Passing Year</label>
                  <input id="sr-passingYear" name="passingYear" type="number" className="form-input" placeholder="2026" value={form.passingYear} onChange={handleChange} />
                </div>
              </div>
              <button id="register-submit" className="btn-primary" onClick={handleRegister} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '🚀 Create Account'}
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: '600' }}>Sign In →</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
