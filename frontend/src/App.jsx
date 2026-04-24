import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';

export default function App() {
  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
}
