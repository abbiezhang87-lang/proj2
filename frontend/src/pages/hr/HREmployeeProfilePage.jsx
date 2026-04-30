import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, Alert, Divider,
} from '@mui/material';

import * as hrApi from '../../api/hrApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// HR-only full profile view. Linked from EmployeeProfilesPage's name column —
// opens in a new tab per spec.
export default function HREmployeeProfilePage() {
  const { userId } = useParams();
  const [app, setApp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await hrApi.getEmployeeProfile(userId);
        setApp(data.application);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;
  if (!app) return null;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {[app.firstName, app.middleName, app.lastName].filter(Boolean).join(' ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">{app.email}</Typography>

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
              <Field
                label="Name"
                value={`${app.reference.firstName} ${app.reference.lastName}`}
              />
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
                <Field key={d._id} label={d.kind} value={d.originalName} />
              ))}
            </Section>
          )}
        </Stack>
      </Paper>
    </Box>
  );
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
