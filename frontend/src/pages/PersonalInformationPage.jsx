import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Box, Paper, Stack, Typography, Button, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';

import * as employeeApi from '../api/employeeApi';
import {
  fetchMyApplication, selectApplication, selectOnboardingStatus,
} from '../store/slices/onboardingSlice';

import NameSection from '../components/forms/NameSection';
import AddressSection from '../components/forms/AddressSection';
import ContactSection from '../components/forms/ContactSection';
import EmploymentSection from '../components/forms/EmploymentSection';
import EmergencyContactSection from '../components/forms/EmergencyContactSection';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Map UI section → backend section param + which form fields it owns. The form
// values still cover everything; we only PATCH the relevant slice on save.
const SECTIONS = [
  { id: 'name',      label: 'Name',              api: 'name',      Component: NameSection },
  { id: 'address',   label: 'Address',           api: 'address',   Component: AddressSection },
  { id: 'contact',   label: 'Contact info',      api: 'contact',   Component: ContactSection,
    componentProps: { lockEmail: true } },
  { id: 'employment', label: 'Employment',       api: 'employment', Component: EmploymentSection },
  { id: 'emergency', label: 'Emergency contact', api: 'emergency', Component: EmergencyContactSection },
];

const SECTION_FIELDS = {
  name: ['firstName', 'lastName', 'middleName', 'preferredName'],
  address: ['address'],
  contact: ['cellPhone', 'workPhone'],
  employment: ['workAuthorization'],
  emergency: ['emergencyContacts'],
};

function toFormValues(profile) {
  if (!profile) return {};
  return {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    middleName: profile.middleName || '',
    preferredName: profile.preferredName || '',
    address: profile.address || { building: '', street: '', city: '', state: '', zip: '' },
    cellPhone: profile.cellPhone || '',
    workPhone: profile.workPhone || '',
    email: profile.email || '',
    ssn: profile.ssn || '',
    dob: profile.dob ? String(profile.dob).slice(0, 10) : '',
    gender: profile.gender || '',
    isCitizenOrPR: typeof profile.isCitizenOrPR === 'boolean' ? profile.isCitizenOrPR : '',
    residencyType: profile.residencyType || '',
    workAuthorization: {
      type: profile.workAuthorization?.type || '',
      otherTitle: profile.workAuthorization?.otherTitle || '',
      startDate: profile.workAuthorization?.startDate ? String(profile.workAuthorization.startDate).slice(0, 10) : '',
      endDate: profile.workAuthorization?.endDate ? String(profile.workAuthorization.endDate).slice(0, 10) : '',
    },
    emergencyContacts: profile.emergencyContacts?.length
      ? profile.emergencyContacts
      : [{ firstName: '', lastName: '', relationship: '' }],
  };
}

function pickPayload(values, fields) {
  const out = {};
  for (const f of fields) if (values[f] !== undefined) out[f] = values[f];
  return out;
}

export default function PersonalInformationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector(selectApplication);
  const status = useSelector(selectOnboardingStatus);
  const [editing, setEditing] = useState(null);  // section.id currently editing
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Per spec §3.b: not-yet-approved users belong on /onboarding.
  useEffect(() => {
    if (status && status !== 'approved') {
      navigate('/onboarding', { replace: true });
    }
  }, [status, navigate]);

  // Pull from server (and re-pull after each save).
  const refresh = async () => {
    try {
      const { data } = await employeeApi.getMyProfile();
      // Reuse the onboarding slice as the source of truth — it stores the
      // application doc which IS the personal info.
      dispatch({ type: 'onboarding/fetch/fulfilled', payload: { application: data.profile, status: data.profile.status } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) dispatch(fetchMyApplication()).then(() => setLoading(false));
    else setLoading(false);
  }, [dispatch, profile]);

  const defaultValues = useMemo(() => toFormValues(profile), [profile]);
  const methods = useForm({ defaultValues });

  // Whenever profile changes, reset the form so it reflects the latest server state.
  useEffect(() => {
    methods.reset(toFormValues(profile));
  }, [profile]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !profile) return <LoadingSpinner />;

  const startEdit = (sectionId) => {
    setEditing(sectionId);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => setConfirmCancel(true);

  const reallyCancel = () => {
    methods.reset(toFormValues(profile)); // discard form changes
    setEditing(null);
    setConfirmCancel(false);
  };

  const save = async (values) => {
    const section = SECTIONS.find((s) => s.id === editing);
    if (!section) return;
    try {
      const payload = pickPayload(values, SECTION_FIELDS[section.api]);
      const { data } = await employeeApi.updateSection(section.api, payload);
      dispatch({ type: 'onboarding/fetch/fulfilled', payload: { application: data.profile, status: data.profile.status } });
      setSuccess(`${section.label} saved`);
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 980, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }} elevation={1}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Personal Information</Typography>
            <Typography variant="body2" color="text.secondary">
              Click Edit on any section. Cancel will ask you to confirm before discarding changes.
            </Typography>
          </Box>

          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

          <FormProvider {...methods}>
            <Stack spacing={3} divider={<Divider flexItem />}>
              {SECTIONS.map(({ id, label, Component, componentProps }) => {
                const isEditing = editing === id;
                return (
                  <Box key={id} sx={{ p: isEditing ? 2 : 0, border: isEditing ? 2 : 0, borderColor: 'primary.main', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: isEditing ? 2 : 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {label}{isEditing && ' · Editing'}
                      </Typography>
                      {isEditing ? (
                        <Stack direction="row" spacing={1}>
                          <Button color="error" size="small" onClick={cancelEdit}>Cancel</Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={methods.handleSubmit(save)}
                          >
                            Save
                          </Button>
                        </Stack>
                      ) : (
                        <Button size="small" onClick={() => startEdit(id)}>Edit</Button>
                      )}
                    </Stack>
                    <Component readOnly={!isEditing} {...(componentProps || {})} />
                  </Box>
                );
              })}

              {/* Documents — view-only here, with download/preview links */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Documents</Typography>
                {(!profile.documents || profile.documents.length === 0) ? (
                  <Typography variant="body2" color="text.secondary">No documents uploaded.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {profile.documents.map((d) => (
                      <Stack key={d._id} direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ minWidth: 180 }}>{d.kind}</Typography>
                        <Typography variant="body2" sx={{ flex: 1 }}>{d.originalName}</Typography>
                        <Button size="small" component="a" href={`/api/employees/me/documents/${d._id}?inline=1`} target="_blank">
                          Preview
                        </Button>
                        <Button size="small" component="a" href={`/api/employees/me/documents/${d._id}`}>
                          Download
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </FormProvider>
        </Stack>
      </Paper>

      <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
        <DialogTitle>Discard changes?</DialogTitle>
        <DialogContent>
          <Typography>Your edits to this section will be lost.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancel(false)}>Keep editing</Button>
          <Button color="error" onClick={reallyCancel}>Discard</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
