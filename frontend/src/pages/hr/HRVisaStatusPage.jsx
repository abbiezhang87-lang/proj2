import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, Stack, Typography, Tabs, Tab, Alert, TextField, Button,
  Table, TableHead, TableBody, TableRow, TableCell, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';

import * as hrApi from '../../api/hrApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STEP_LABELS = {
  optReceipt: 'OPT Receipt',
  optEad: 'OPT EAD',
  i983: 'I-983',
  i20: 'I-20',
};

export default function HRVisaStatusPage() {
  const [tab, setTab] = useState('inProgress');
  const [inProgress, setInProgress] = useState([]);
  const [all, setAll] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewing, setReviewing] = useState(null);   // { userId, step, documentId }
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'inProgress') {
        const { data } = await hrApi.listVisaInProgress();
        setInProgress(data.employees || []);
      } else {
        const { data } = await hrApi.listVisaAll({ search });
        setAll(data.employees || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    if (tab === 'all') {
      const t = setTimeout(fetchData, 300);
      return () => clearTimeout(t);
    }
    fetchData();
    return undefined;
  }, [tab, search, fetchData]);

  const submitReview = async (decision) => {
    if (!reviewing) return;
    if (decision === 'reject' && !feedback.trim()) {
      setError('Feedback required when rejecting');
      return;
    }
    setBusy(true);
    try {
      await hrApi.reviewVisaDocument(reviewing.userId, reviewing.step, { decision, feedback });
      setReviewing(null);
      setFeedback('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Review failed');
    } finally {
      setBusy(false);
    }
  };

  const sendNotification = async (userId) => {
    setBusy(true);
    try {
      await hrApi.sendNextStepNotification(userId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Visa Status Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Review each employee's OPT progress. Approve, reject, or send a reminder.
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
          <Tab value="inProgress" label="In progress" />
          <Tab value="all" label="All" />
        </Tabs>

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        {tab === 'all' && (
          <TextField
            placeholder="Search employees"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        )}

        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }} elevation={1}>
          {loading ? (
            <LoadingSpinner />
          ) : tab === 'inProgress' ? (
            <InProgressTable
              rows={inProgress}
              onReview={(row) => {
                setReviewing({
                  userId: row.userId,
                  step: row.nextStep,
                  documentId: row.currentStepDocument,
                });
                setFeedback('');
              }}
              onNotify={sendNotification}
              busy={busy}
            />
          ) : (
            <AllTable rows={all} />
          )}
        </Paper>
      </Stack>

      {/* Review dialog */}
      <Dialog open={Boolean(reviewing)} onClose={() => setReviewing(null)} maxWidth="sm" fullWidth>
        {reviewing && (
          <>
            <DialogTitle>
              Review {STEP_LABELS[reviewing.step]}
            </DialogTitle>
            <DialogContent dividers>
              {reviewing.documentId ? (
                <Stack spacing={2}>
                  <Button
                    component="a"
                    href={`/api/onboarding/documents/${reviewing.documentId}?inline=1`}
                    target="_blank"
                    variant="outlined"
                  >
                    Preview document
                  </Button>
                  <TextField
                    label="Feedback (required for reject)"
                    multiline
                    minRows={3}
                    fullWidth
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </Stack>
              ) : (
                <Typography>No document uploaded yet for this step.</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReviewing(null)}>Close</Button>
              <Button
                color="error"
                onClick={() => submitReview('reject')}
                disabled={busy || !reviewing.documentId}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                onClick={() => submitReview('approve')}
                disabled={busy || !reviewing.documentId}
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

function InProgressTable({ rows, onReview, onNotify, busy }) {
  if (rows.length === 0) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">No employees in progress.</Typography>
    </Box>;
  }
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Work auth</TableCell>
          <TableCell>Days left</TableCell>
          <TableCell>Next step</TableCell>
          <TableCell align="right">Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => {
          const stepLabel = STEP_LABELS[r.nextStep] || r.nextStep;
          const waitingForHR = r.currentStepStatus === 'pending';
          return (
            <TableRow key={r.userId} hover>
              <TableCell sx={{ fontWeight: 500 }}>{r.fullName}</TableCell>
              <TableCell>
                {r.workAuth.type}
                {r.workAuth.startDate && r.workAuth.endDate && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {String(r.workAuth.startDate).slice(0, 10)} → {String(r.workAuth.endDate).slice(0, 10)}
                  </Typography>
                )}
              </TableCell>
              <TableCell>{r.workAuth.daysRemaining ?? '—'}</TableCell>
              <TableCell>
                {waitingForHR ? `Approve ${stepLabel}` : `Waiting on employee: ${stepLabel}`}
              </TableCell>
              <TableCell align="right">
                {waitingForHR ? (
                  <Button size="small" variant="contained" onClick={() => onReview(r)}>
                    Review
                  </Button>
                ) : (
                  <Button size="small" disabled={busy} onClick={() => onNotify(r.userId)}>
                    Send notification
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function AllTable({ rows }) {
  if (rows.length === 0) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">No OPT employees yet.</Typography>
    </Box>;
  }
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Work auth</TableCell>
          <TableCell>Approved documents</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.userId} hover>
            <TableCell sx={{ fontWeight: 500 }}>{r.fullName}</TableCell>
            <TableCell>{r.workAuth?.type}</TableCell>
            <TableCell>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {r.approvedDocs.length === 0 && (
                  <Typography variant="caption" color="text.secondary">None yet</Typography>
                )}
                {r.approvedDocs.map((d) => (
                  <Chip
                    key={d.step}
                    label={STEP_LABELS[d.step]}
                    component="a"
                    href={`/api/onboarding/documents/${d.documentId}?inline=1`}
                    target="_blank"
                    clickable
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
