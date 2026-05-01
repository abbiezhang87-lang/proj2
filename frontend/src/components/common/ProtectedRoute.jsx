import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import {
  selectIsAuthenticated,
  selectRole,
  selectAuthStatus,
} from '../../store/slices/authSlice';
import LoadingSpinner from './LoadingSpinner';

// <ProtectedRoute>           — any logged-in user
// <ProtectedRoute role="hr"> — HR only
// <ProtectedRoute role="employee"> — employee only
export default function ProtectedRoute({ children, role }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectRole);
  const status = useSelector(selectAuthStatus);
  const location = useLocation();

  // While the initial /me request is in flight, don't bounce the user.
  if (status === 'loading' && !isAuth) return <LoadingSpinner />;

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
