import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, TextField, Button, Alert,
} from '@mui/material';

import {
  register as registerThunk,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
  clearError,
} from '../store/slices/authSlice';

export default function RegistrationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Trim — copy/paste from the email link sometimes brings whitespace/newlines.
  const token = (params.get('token') || '').trim();

  const isAuth = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });
  const password = watch('password');

  useEffect(() => {
    if (isAuth) navigate('/', { replace: true });
  }, [isAuth, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = (values) => {
    const { confirmPassword: _ignored, ...rest } = values;
    dispatch(registerThunk({ ...rest, token }));
  };

  if (!token) {
    return (
      <Box sx={{ p: 4, maxWidth: 480, mx: 'auto' }}>
        <Alert severity="error">
          This page requires a registration token. Please use the link from your invitation email.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f5f3ee',
      p: 2,
    }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 3 }} elevation={1}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Create your account</Typography>
            <Typography variant="body2" color="text.secondary">
              Using the invitation sent to you by HR
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
            })}
            fullWidth
          />
          <TextField
            label="Username"
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            {...register('username', {
              required: 'Required',
              minLength: { value: 3, message: 'At least 3 characters' },
            })}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password', {
              required: 'Required',
              minLength: { value: 6, message: 'At least 6 characters' },
            })}
            fullWidth
          />
          <TextField
            label="Confirm password"
            type="password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Required',
              validate: (v) => v === password || "Passwords don't match",
            })}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Creating account...' : 'Create account'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
