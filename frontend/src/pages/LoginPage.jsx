import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Stack, Typography, TextField, Button, Alert } from '@mui/material';

import {
  login,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
  clearError,
} from '../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: '', password: '' },
  });

  // Redirect if already logged in.
  useEffect(() => {
    if (isAuth) {
      const dest = location.state?.from || '/';
      navigate(dest, { replace: true });
    }
  }, [isAuth, navigate, location.state]);

  // Clear stale error when user starts typing.
  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = (values) => dispatch(login(values));

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f5f3ee',
      p: 2,
    }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 380, borderRadius: 3 }} elevation={1}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your HR portal
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Username or email"
            autoComplete="username"
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            {...register('username', { required: 'Required' })}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password', { required: 'Required' })}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
