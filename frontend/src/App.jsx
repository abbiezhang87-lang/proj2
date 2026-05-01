import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';
import { fetchCurrentUser } from './store/slices/authSlice';
import { getToken } from './api/axiosInstance';

export default function App() {
  const dispatch = useDispatch();

  // Restore session on first load if a JWT is sitting in localStorage.
  useEffect(() => {
    if (getToken()) dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
}
