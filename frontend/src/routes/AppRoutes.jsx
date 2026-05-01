import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import HomePage from '../pages/HomePage';

import OnboardingApplicationPage from '../pages/OnboardingApplicationPage';
import PersonalInformationPage from '../pages/PersonalInformationPage';
import VisaStatusManagementPage from '../pages/VisaStatusManagementPage';

import EmployeeProfilesPage from '../pages/hr/EmployeeProfilesPage';
import HREmployeeProfilePage from '../pages/hr/HREmployeeProfilePage';
import HRVisaStatusPage from '../pages/hr/HRVisaStatusPage';
import HiringManagementPage from '../pages/hr/HiringManagementPage';
import HRApplicationReviewPage from '../pages/hr/HRApplicationReviewPage';

import ProtectedRoute from '../components/common/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />

      {/* Authenticated (any role) */}
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute role="employee"><OnboardingApplicationPage /></ProtectedRoute>} />
      <Route path="/personal-info" element={<ProtectedRoute role="employee"><PersonalInformationPage /></ProtectedRoute>} />
      <Route path="/visa-status" element={<ProtectedRoute role="employee"><VisaStatusManagementPage /></ProtectedRoute>} />

      {/* HR-only */}
      <Route path="/hr/employees" element={<ProtectedRoute role="hr"><EmployeeProfilesPage /></ProtectedRoute>} />
      <Route path="/hr/employees/:userId" element={<ProtectedRoute role="hr"><HREmployeeProfilePage /></ProtectedRoute>} />
      <Route path="/hr/visa" element={<ProtectedRoute role="hr"><HRVisaStatusPage /></ProtectedRoute>} />
      <Route path="/hr/hiring" element={<ProtectedRoute role="hr"><HiringManagementPage /></ProtectedRoute>} />
      <Route path="/hr/applications/:applicationId" element={<ProtectedRoute role="hr"><HRApplicationReviewPage /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
