import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, Alert, Divider, Button, TextField, Chip,
} from '@mui/material';

import * as hrApi from '../../api/hrApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Full-page application viewer — opened in a new tab from Hiring Management.
// Approve/Reject buttons are only shown for pending applications.
export default function HRApplicationReviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Cheap way to fetch a single application: list all and find by id.
        // (We could add a dedicated GET /hr/applications/:id endpoint if this
        // becomes a hot path.)
        const { data } = await hrApi.listApplications();
        const found = (data.applications || []).find((a) => a._id === applicationId);
        if (!found) throw new Error('Application not found');
        setApp(found);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [applicationId]);

  const review = async (decision) => {
    if (decision === 'reject' && !feedback.trim()) {
      setError('Feedback is required when rejecting');
      return;
    }
    setBusy(true);
    try {
      await hrApi.reviewApplication(applicationId, { decision, feedback });
      setSuccess(`Application ${decision === 'approve' ? 'approved' : 'rejected'}.`);
      setTimeout(() => window.close() || navigate('/hr/hiring'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Review failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !app) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;
  if (!app) return null;

  const isPending = app.status === 'pending';

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 920, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }} elevation={1}>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {[app.firstName, app.middleName, app.lastName].filter(Boolean).join(' ')}
              </Typography>
              <StatusChip status={app.status} />
            </Stack>
            <Typography variant="body2" color="text.secondary">{app.email}</Typography>
          </Box>

          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          {app.status === 'rejected' && app.feedback && (
            <Alert severity="error">
              <strong>Previous feedback:</strong> {app.feedback}
            </Alert>
          )}

          <Divider />

          <Section title="Name">
            <Field label="First" value={app.firstName} />
            <Field label="Last" value={app.lastName} />
            <Field label="Middle" value={app.middleName || '—'} />
            <Field label="Preferred" value={app.preferredName || '—'} />
          </Section>

          <Section title="Address">
            <Field
              label="Address"
              value={app.address
                ? `${app.address.building} ${app.address.street}, ${app.address.city}, ${app.address.state} ${app.address.zip}`
                : '—'}
            />
          </Section>

          <Section title="Contact & identity">
            <Field label="Cell phone" value={app.cellPhone} />
            <Field label="Work phone" value={app.workPhone || '—'} />
            <Field label="SSN" value={app.ssn} />
            <Field label="DOB" value={app.dob ? String(app.dob).slice(0, 10) : '—'} />
            <Field label="Gender" value={app.gender} />
          </Section>

          <Section title="Work authorization">
            <Field
              label="Citizen / PR"
              value={app.isCitizenOrPR ? `Yes — ${app.residencyType}` : 'No'}
            />
            {!app.isCitizenOrPR && app.workAuthorization && (
              <>
                <Field label="Visa" value={app.workAuthorization.type} />
                {app.workAuthorization.otherTitle && (
                  <Field label="Title" value={app.workAuthorization.otherTitle} />
                )}
                <Field
                  label="Period"
                  value={`${String(app.workAuthorization.startDate || '').slice(0, 10)} → ${String(app.workAuthorization.endDate || '').slice(0, 10)}`}
                />
              </>
            )}
          </Section>

          {app.reference && (
            <Section title="Reference">
              <Field label="Name" value={`${app.reference.firstName} ${app.reference.lastName}`} />
              <Field label="Relationship" value={app.reference.relationship} />
              <Field label="Email" value={app.reference.email || '—'} />
              <Field label="Phone" value={app.reference.phone || '—'} />
            </Section>
          )}

          {app.emergencyContacts?.length > 0 && (
            <Section title="Emergency contacts">
              {app.emergencyContacts.map((c, i) => (
                <Field
                  key={i}
                  label={`Contact ${i + 1}`}
                  value={`${c.firstName} ${c.lastName} (${c.relationship}) — ${c.phone || '—'} ${c.email || ''}`}
                />
              ))}
            </Section>
          )}

          {app.documents?.length > 0 && (
            <Section title="Documents">
              {app.documents.map((d) => (
                <Stack key={d._id} direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 160, color: 'text.secondary' }}>
                    {d.kind}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>{d.originalName}</Typography>
                  <Button size="small" component="a" href={`/api/onboarding/documents/${d._id}?inline=1`} target="_blank">
                    Preview
                  </Button>
                  <Button size="small" component="a" href={`/api/onboarding/documents/${d._id}`}>
                    Download
                  </Button>
                </Stack>
              ))}
            </Section>
          )}

          {/* Approve/reject only for pending. */}
          {isPending && (
            <>
              <Divider />
              <TextField
                label="Feedback (required when rejecting)"
                multiline
                minRows={3}
                fullWidth
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button color="error" disabled={busy} onClick={() => review('reject')}>
                  Reject
                </Button>
                <Button variant="contained" disabled={busy} onClick={() => review('approve')}>
                  Approve
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

function StatusChip({ status }) {
  const map = {
    pending: { label: 'Pending', color: 'warning' },
    approved: { label: 'Approved', color: 'success' },
    rejected: { label: 'Rejected', color: 'error' },
  };
  const cfg = map[status] || { label: status };
  return <Chip {...cfg} size="small" />;
}

function Section({ title, children }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>{title}</Typography>
      <Stack spacing={0.5}>{children}</Stack>
    </Box>
  );
}

function Field({ label, value }) {
  return (
    <Stack direction="row" spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>{label}</Typography>
      <Typography variant="body2" sx={{ flex: 1 }}>{value}</Typography>
    </Stack>
  );
}
