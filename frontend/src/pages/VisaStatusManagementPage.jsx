import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Stack, Typography, Alert, Chip, Button, Divider,
} from '@mui/material';

import {
  fetchMyVisaStatus, uploadNextVisaDocument,
  selectVisaStatus, selectVisaNextStep, selectVisaLoading, selectVisaError,
} from '../store/slices/visaSlice';
import DocumentUploader from '../components/documents/DocumentUploader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STEPS = [
  { key: 'optReceipt', label: 'OPT Receipt' },
  { key: 'optEad',     label: 'OPT EAD' },
  { key: 'i983',       label: 'I-983' },
  { key: 'i20',        label: 'I-20' },
];

// Per-step "what does the user see now?" copy. Pulled directly from spec §6.
const COPY = {
  optReceipt: {
    pending:  'Waiting for HR to approve your OPT Receipt.',
    approved: 'Please upload a copy of your OPT EAD.',
    rejected: 'Your OPT Receipt was rejected. Please review feedback and resubmit.',
  },
  optEad: {
    pending:  'Waiting for HR to approve your OPT EAD.',
    approved: 'Please download and fill out the I-983 form.',
    rejected: 'Your OPT EAD was rejected. Please review feedback and resubmit.',
  },
  i983: {
    pending:  'Waiting for HR to approve and sign your I-983.',
    approved: 'Please send the I-983 along with all necessary documents to your school and upload the new I-20.',
    rejected: 'Your I-983 was rejected. Please review feedback and resubmit.',
  },
  i20: {
    pending:  'Waiting for HR to approve your I-20.',
    approved: 'All documents have been approved.',
    rejected: 'Your I-20 was rejected. Please review feedback and resubmit.',
  },
};

function statusChip(status) {
  if (status === 'approved') return <Chip label="Approved" color="success" size="small" />;
  if (status === 'pending') return <Chip label="Pending" color="warning" size="small" />;
  if (status === 'rejected') return <Chip label="Rejected" color="error" size="small" />;
  return <Chip label="Not started" size="small" />;
}

export default function VisaStatusManagementPage() {
  const dispatch = useDispatch();
  const visa = useSelector(selectVisaStatus);
  const nextStep = useSelector(selectVisaNextStep);
  const loading = useSelector(selectVisaLoading);
  const error = useSelector(selectVisaError);

  useEffect(() => { dispatch(fetchMyVisaStatus()); }, [dispatch]);

  if (loading === 'loading' && !visa) return <LoadingSpinner />;

  // Spec: only show this page's content if the employee is on OPT (i.e. they
  // have a VisaStatus document).
  if (!visa) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
          <Typography variant="body1">
            Visa Status Management is only available for OPT employees.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const handleUpload = async (file) => {
    const action = await dispatch(uploadNextVisaDocument(file));
    if (action.error) throw new Error(action.payload || 'Upload failed');
  };

  const allDone = !nextStep;
  const current = nextStep ? visa[nextStep] : null;
  const currentCopy = nextStep && COPY[nextStep][current.status === 'not_uploaded' ? 'pending' : current.status];

  // Show upload UI only when the next step needs the employee to act:
  //   - not_uploaded (e.g. just got unblocked by previous step approval)
  //   - rejected (resubmit)
  const canUpload = nextStep && (current.status === 'not_uploaded' || current.status === 'rejected');

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 920, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }} elevation={1}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Visa Status Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Documents unlock one after another. Next upload becomes available once HR approves the previous step.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {/* Stepper */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} divider={<Divider flexItem orientation="vertical" />}>
            {STEPS.map((s) => {
              const step = visa[s.key];
              const isCurrent = nextStep === s.key;
              return (
                <Box
                  key={s.key}
                  sx={{
                    flex: 1, p: 1.5, borderRadius: 2, textAlign: 'center',
                    bgcolor: isCurrent ? 'rgba(245, 228, 200, 0.5)' : 'background.default',
                    border: 1,
                    borderColor: isCurrent ? 'warning.light' : 'divider',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{s.label}</Typography>
                  <Box sx={{ mt: 0.5 }}>{statusChip(step.status)}</Box>
                </Box>
              );
            })}
          </Stack>

          {/* Current step message + actions */}
          {allDone ? (
            <Alert severity="success">All documents have been approved.</Alert>
          ) : (
            <>
              <Alert severity={current.status === 'rejected' ? 'error' : 'info'}>
                {currentCopy}
              </Alert>

              {current.status === 'rejected' && current.feedback && (
                <Alert severity="error">
                  <strong>HR feedback:</strong> {current.feedback}
                </Alert>
              )}

              {nextStep === 'i983' && (
                <Stack direction="row" spacing={1.5}>
                  <Button size="small" variant="outlined" component="a" href="/i983-empty.pdf" target="_blank" rel="noopener">
                    Download empty template
                  </Button>
                  <Button size="small" variant="outlined" component="a" href="/i983-sample.pdf" target="_blank" rel="noopener">
                    Download sample
                  </Button>
                </Stack>
              )}

              {canUpload && (
                <DocumentUploader
                  label={`Upload ${STEPS.find((s) => s.key === nextStep).label}`}
                  accept=".pdf,image/*"
                  onUpload={handleUpload}
                />
              )}
            </>
          )}

          {/* Approved-doc history */}
          <Divider />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Document history</Typography>
          <Stack spacing={1}>
            {STEPS.map((s) => {
              const step = visa[s.key];
              if (step.status === 'not_uploaded') return null;
              return (
                <Stack key={s.key} direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 110 }}>{s.label}</Typography>
                  {statusChip(step.status)}
                  {step.document && (
                    <Typography variant="caption" color="text.secondary">
                      {step.document.originalName || step.document._id}
                    </Typography>
                  )}
                  {step.document?._id && (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" component="a" href={`/api/visa/me/documents/${step.document._id}?inline=1`} target="_blank">
                        Preview
                      </Button>
                      <Button size="small" component="a" href={`/api/visa/me/documents/${step.document._id}`}>
                        Download
                      </Button>
                    </Stack>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
