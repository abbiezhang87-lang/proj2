import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Shared
import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import HomePage from '../pages/HomePage';

// Employee
import OnboardingApplicationPage from '../pages/OnboardingApplicationPage';
import PersonalInformationPage from '../pages/PersonalInformationPage';
import VisaStatusManagementPage from '../pages/VisaStatusManagementPage';

// HR
import EmployeeProfilesPage from '../pages/hr/EmployeeProfilesPage';
import HRVisaStatusPage from '../pages/hr/HRVisaStatusPage';
import HiringManagementPage from '../pages/hr/HiringManagementPage';

// import ProtectedRoute from '../components/common/ProtectedRoute';

export default function AppRoutes() {
  // TODO: wrap private routes with <ProtectedRoute /> and an HR gate
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />

      {/* Employee */}
      <Route path="/" element={<HomePage />} />
      <Route path="/onboarding" element={<OnboardingApplicationPage />} />
      <Route path="/personal-info" element={<PersonalInformationPage />} />
      <Route path="/visa-status" element={<VisaStatusManagementPage />} />

      {/* HR */}
      <Route path="/hr/employees" element={<EmployeeProfilesPage />} />
      <Route path="/hr/visa" element={<HRVisaStatusPage />} />
      <Route path="/hr/hiring" element={<HiringManagementPage />} />
    </Routes>
  );
}
