import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Paper, Typography, Stack, Button, Alert, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import * as hrApi from '../../api/hrApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function HiringManagementPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastLink, setLastLink] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { email: '', name: '' },
  });

  const fetchTokens = useCallback(async () => {
    try {
      const { data } = await hrApi.listTokenHistory();
      setTokens(data.tokens || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      const { data } = await hrApi.generateToken(values);
      setLastLink(data.link || '');
      reset({ email: '', name: '' });
      fetchTokens();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard?.writeText(link);
  };

  // Build the registration URL the way tokenService does on the backend.
  const buildLink = (token) => {
    const base = window.location.origin; // works because FE and link target same origin
    return `${base}/register?token=${token}`;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Hiring Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Invite new hires and review their onboarding applications.
          </Typography>
        </Box>

        {/* Send invite */}
        <Paper sx={{ p: 3, borderRadius: 3 }} elevation={1}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Send registration invite
            </Typography>

            {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

            {lastLink && (
              <Alert severity="success" onClose={() => setLastLink('')}>
                Invitation sent. Direct link:{' '}
                <Box component="span" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {lastLink}
                </Box>
              </Alert>
            )}

            <Stack
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'flex-end' }}
            >
              <TextField
                label="Email *"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email', {
                  required: 'Required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
              />
              <TextField
                label="Name"
                fullWidth
                {...register('name')}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ minWidth: 180, alignSelf: { sm: 'stretch' } }}
              >
                {submitting ? 'Sending…' : 'Generate & send'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* History */}
        <Paper sx={{ p: 3, borderRadius: 3 }} elevation={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Recent invitations
          </Typography>

          {loading ? (
            <LoadingSpinner />
          ) : tokens.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No invitations sent yet.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Sent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map((t) => {
                  const link = buildLink(t.token);
                  const expired = !t.used && new Date(t.expiresAt) < new Date();
                  return (
                    <TableRow key={t._id}>
                      <TableCell>{t.email}</TableCell>
                      <TableCell>{t.name || '—'}</TableCell>
                      <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {t.used ? (
                          <Chip label="Submitted" color="success" size="small" />
                        ) : expired ? (
                          <Chip label="Expired" size="small" />
                        ) : (
                          <Chip label="Not yet" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Copy link">
                          <IconButton size="small" onClick={() => copyLink(link)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
