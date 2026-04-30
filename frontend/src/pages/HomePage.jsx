import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';

import { selectUser, selectRole } from '../store/slices/authSlice';
import {
  fetchMyApplication,
  selectOnboardingStatus,
  selectOnboardingLoading,
} from '../store/slices/onboardingSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const onboardingStatus = useSelector(selectOnboardingStatus);
  const onboardingLoading = useSelector(selectOnboardingLoading);

  // Per spec: employees are redirected to /onboarding unless their application
  // has been approved. HR users skip this entirely.
  useEffect(() => {
    if (role === 'employee' && onboardingLoading === 'idle') {
      dispatch(fetchMyApplication());
    }
  }, [role, onboardingLoading, dispatch]);

  useEffect(() => {
    if (role === 'employee' && onboardingStatus && onboardingStatus !== 'approved') {
      navigate('/onboarding', { replace: true });
    }
  }, [role, onboardingStatus, navigate]);

  // While we figure out where the employee should be, show a spinner.
  if (role === 'employee' && onboardingStatus !== 'approved') {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Welcome, {user?.username}
          </Typography>
          <Typography color="text.secondary">
            {role === 'hr'
              ? 'Use the navigation above to manage onboarding, employees, and visa documents.'
              : 'Your onboarding application has been approved. Use the navigation above to update your personal info or check your visa status.'}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ pt: 2 }}>
            {role === 'hr' ? (
              <>
                <Button component={RouterLink} to="/hr/hiring" variant="contained">Hiring</Button>
                <Button component={RouterLink} to="/hr/employees" variant="outlined">Employees</Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/personal-info" variant="contained">Personal info</Button>
                <Button component={RouterLink} to="/visa-status" variant="outlined">Visa status</Button>
              </>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
