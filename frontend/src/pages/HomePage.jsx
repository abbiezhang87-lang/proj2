import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { selectUser, selectRole } from '../store/slices/authSlice';

export default function HomePage() {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

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
              : 'Use the navigation above to update your personal information or check your visa status.'}
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
