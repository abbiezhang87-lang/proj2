import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Paper, Typography, Stack, Button, Alert, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Tooltip,
  Tabs, Tab,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import * as hrApi from '../../api/hrApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUSES = ['pending', 'rejected', 'approved'];

export default function HiringManagementPage() {
  // --- token state ---
  const [tokens, setTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [lastLink, setLastLink] = useState('');

  // --- review state ---
  const [tab, setTab] = useState('pending');
  const [applications, setApplications] = useState([]);
  const [totals, setTotals] = useState({ pending: 0, rejected: 0, approved: 0 });
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { email: '', name: '' },
  });

  // --- fetchers ---
  const fetchTokens = useCallback(async () => {
    try {
      const { data } = await hrApi.listTokenHistory();
      setTokens(data.tokens || []);
    } catch (err) {
      setTokenError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setTokensLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async (status) => {
    setAppsLoading(true);
    try {
      const { data } = await hrApi.listApplications(status);
      setApplications(data.applications || []);
      setTotals(data.totals || { pending: 0, rejected: 0, approved: 0 });
    } catch (err) {
      setAppsError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setAppsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);
  useEffect(() => { fetchApplications(tab); }, [tab, fetchApplications]);

  // --- token form ---
  const onSubmitToken = async (values) => {
    setSubmitting(true);
    setTokenError('');
    try {
      const { data } = await hrApi.generateToken(values);
      setLastLink(data.link || '');
      reset({ email: '', name: '' });
      fetchTokens();
    } catch (err) {
      setTokenError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const buildLink = (token) => `${window.location.origin}/register?token=${token}`;
  const copyLink = (link) => navigator.clipboard?.writeText(link);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Hiring Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Invite new hires and review their onboarding applications.
          </Typography>
        </Box>

        {/* --- Send invite --- */}
        <Paper sx={{ p: 3, borderRadius: 3 }} elevation={1}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Send registration invite
            </Typography>

            {tokenError && <Alert severity="error" onClose={() => setTokenError('')}>{tokenError}</Alert>}
            {lastLink && (
              <Alert
                severity="success"
                onClose={() => setLastLink('')}
                action={
                  <Button color="inherit" size="small" onClick={() => copyLink(lastLink)}>
                    Copy link
                  </Button>
                }
              >
                Invitation sent. Use the Copy button — selecting the link by hand
                can pick up line breaks.
              </Alert>
            )}

            <Stack
              component="form"
              onSubmit={handleSubmit(onSubmitToken)}
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

        {/* --- Token history --- */}
        <Paper sx={{ p: 3, borderRadius: 3 }} elevation={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Recent invitations
          </Typography>

          {tokensLoading ? (
            <LoadingSpinner />
          ) : tokens.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No invitations sent yet.</Typography>
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

        {/* --- Application review --- */}
        <Paper sx={{ p: 3, borderRadius: 3 }} elevation={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Onboarding application review
          </Typography>

          <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
            {STATUSES.map((s) => (
              <Tab
                key={s}
                value={s}
                label={`${s.charAt(0).toUpperCase() + s.slice(1)} · ${totals[s] ?? 0}`}
              />
            ))}
          </Tabs>

          {appsError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAppsError('')}>{appsError}</Alert>}

          {appsLoading ? (
            <LoadingSpinner />
          ) : applications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No {tab} applications.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Full name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((a) => (
                  <TableRow key={a._id} hover>
                    <TableCell>{[a.firstName, a.middleName, a.lastName].filter(Boolean).join(' ')}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell align="right">
                      {/* Spec: opens in a new tab */}
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/hr/applications/${a._id}`}
                        target="_blank"
                        rel="noopener"
                      >
                        View application ↗
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
