import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import RegisterMentor from './pages/RegisterMentor';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import MyNotes from './pages/student/MyNotes';
import MyMentor from './pages/student/MyMentor';
import AskAI from './pages/student/AskAI';
import StudentChat from './pages/student/Chat';

// Mentor pages
import MentorDashboard from './pages/mentor/Dashboard';
import MentorNotes from './pages/mentor/Notes';
import MentorStudents from './pages/mentor/Students';
import MentorEditProfile from './pages/mentor/EditProfile';

// Student extra pages
import MentorDetail from './pages/student/MentorDetail';

// Admin pages
import AdminPanel from './pages/admin/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '0.875rem',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1a1a2e' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' },
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<RegisterStudent />} />
          <Route path="/register/mentor" element={<RegisterMentor />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/notes" element={<PrivateRoute role="student"><MyNotes /></PrivateRoute>} />
          <Route path="/student/mentor" element={<PrivateRoute role="student"><MyMentor /></PrivateRoute>} />
          <Route path="/student/ask-ai" element={<PrivateRoute role="student"><AskAI /></PrivateRoute>} />
          <Route path="/student/chat/:userId" element={<PrivateRoute role="student"><StudentChat /></PrivateRoute>} />

          {/* Mentor Routes */}
          <Route path="/mentor/dashboard" element={<PrivateRoute role="mentor"><MentorDashboard /></PrivateRoute>} />
          <Route path="/mentor/notes" element={<PrivateRoute role="mentor"><MentorNotes /></PrivateRoute>} />
          <Route path="/mentor/students" element={<PrivateRoute role="mentor"><MentorStudents /></PrivateRoute>} />
          <Route path="/mentor/profile" element={<PrivateRoute role="mentor"><MentorEditProfile /></PrivateRoute>} />
          <Route path="/mentor/chat/:userId" element={<PrivateRoute role="mentor"><StudentChat /></PrivateRoute>} />

          {/* Shared / Misc Routes */}
          <Route path="/mentor-detail/:mentorId" element={<PrivateRoute role="student"><MentorDetail /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/panel" element={<PrivateRoute role="admin"><AdminPanel /></PrivateRoute>} />

          {/* Catch-all */}
          <Route path="*" element={
            <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>404</div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page Not Found</h1>
              <a href="/" style={{ color: '#6366f1', marginTop: '1rem' }}>← Back to Home</a>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
