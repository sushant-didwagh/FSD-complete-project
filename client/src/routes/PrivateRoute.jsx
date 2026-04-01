import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECTS = {
  student: '/student/dashboard',
  mentor: '/mentor/dashboard',
  admin: '/admin/panel',
};

/**
 * PrivateRoute — wraps protected routes
 * @param {string} role - required role. If not set, any authenticated user is allowed.
 */
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f1a' }}>
        <div className="spinner" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role
  if (role && user.role !== role) {
    const redirect = ROLE_REDIRECTS[user.role] || '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default PrivateRoute;
