import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Box, Paper, Typography, Stack, Button, Alert, Chip, Divider, Avatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

import {
  fetchMyApplication, submitApplication, uploadDocument,
  selectApplication, selectOnboardingStatus, selectOnboardingLoading,
  selectOnboardingError, clearError,
} from '../store/slices/onboardingSlice';
import { selectUser } from '../store/slices/authSlice';

import NameSection from '../components/forms/NameSection';
import AddressSection from '../components/forms/AddressSection';
import ContactSection from '../components/forms/ContactSection';
import EmploymentSection from '../components/forms/EmploymentSection';
import ReferenceSection from '../components/forms/ReferenceSection';
import EmergencyContactSection from '../components/forms/EmergencyContactSection';
import DocumentUploader from '../components/documents/DocumentUploader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EMPTY_DEFAULTS = {
  firstName: '', lastName: '', middleName: '', preferredName: '',
  address: { building: '', street: '', city: '', state: '', zip: '' },
  cellPhone: '', workPhone: '', email: '',
  ssn: '', dob: '', gender: '',
  isCitizenOrPR: '', residencyType: '',
  workAuthorization: { type: '', otherTitle: '', startDate: '', endDate: '' },
  reference: { firstName: '', lastName: '', middleName: '', phone: '', email: '', relationship: '' },
  emergencyContacts: [{ firstName: '', lastName: '', middleName: '', phone: '', email: '', relationship: '' }],
};

function toFormValues(app, userEmail) {
  if (!app) return { ...EMPTY_DEFAULTS, email: userEmail || '' };
  const dob = app.dob ? String(app.dob).slice(0, 10) : '';
  const wa = app.workAuthorization || {};
  return {
    firstName: app.firstName || '',
    lastName: app.lastName || '',
    middleName: app.middleName || '',
    preferredName: app.preferredName || '',
    address: {
      building: app.address?.building || '',
      street: app.address?.street || '',
      city: app.address?.city || '',
      state: app.address?.state || '',
      zip: app.address?.zip || '',
    },
    cellPhone: app.cellPhone || '',
    workPhone: app.workPhone || '',
    email: app.email || userEmail || '',
    ssn: app.ssn || '',
    dob,
    gender: app.gender || '',
    isCitizenOrPR: typeof app.isCitizenOrPR === 'boolean' ? app.isCitizenOrPR : '',
    residencyType: app.residencyType || '',
    workAuthorization: {
      type: wa.type || '',
      otherTitle: wa.otherTitle || '',
      startDate: wa.startDate ? String(wa.startDate).slice(0, 10) : '',
      endDate: wa.endDate ? String(wa.endDate).slice(0, 10) : '',
    },
    reference: app.reference || EMPTY_DEFAULTS.reference,
    emergencyContacts: (app.emergencyContacts && app.emergencyContacts.length)
      ? app.emergencyContacts
      : EMPTY_DEFAULTS.emergencyContacts,
  };
}

export default function OnboardingApplicationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const application = useSelector(selectApplication);
  const status = useSelector(selectOnboardingStatus);
  const loading = useSelector(selectOnboardingLoading);
  const error = useSelector(selectOnboardingError);

  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  const readOnly = isPending; // pending = view-only; rejected/never_submitted = editable

  const defaultValues = useMemo(
    () => toFormValues(application, user?.email),
    [application, user?.email]
  );

  const methods = useForm({ defaultValues });

  // Pull data on mount.
  useEffect(() => { dispatch(fetchMyApplication()); }, [dispatch]);

  // Reset form whenever application data changes (after fetch / submit).
  useEffect(() => {
    methods.reset(toFormValues(application, user?.email));
  }, [application, user?.email]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Approved → bounce to home.
  useEffect(() => {
    if (isApproved) navigate('/', { replace: true });
  }, [isApproved, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  if (loading === 'loading' && !application) return <LoadingSpinner />;

  const onSubmit = (values) => dispatch(submitApplication(values));

  const handleUpload = async (kind, file) => {
    const action = await dispatch(uploadDocument({ file, kind }));
    if (action.error) throw new Error(action.payload || 'Upload failed');
  };

  // Watch the visa type so we can conditionally show an OPT Receipt uploader.
  const visaType = methods.watch('workAuthorization.type');
  const isOPT = visaType === 'F1';

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 980, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }} elevation={1}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Onboarding Application
              </Typography>
              {status === 'pending' && <Chip label="Pending" color="warning" size="small" />}
              {status === 'rejected' && <Chip label="Rejected" color="error" size="small" />}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {status === 'not_submitted' && 'Fill in your information and submit for HR review.'}
              {status === 'pending' && 'Please wait for HR to review your application.'}
              {status === 'rejected' && "Review HR's feedback below, update what's needed, and resubmit."}
            </Typography>
          </Box>

          {status === 'rejected' && application?.feedback && (
            <Alert severity="error">
              <strong>HR feedback:</strong> {application.feedback}
            </Alert>
          )}

          {error && <Alert severity="error" onClose={() => dispatch(clearError())}>{error}</Alert>}

          {/* Profile picture / documents — uploadable independently of the form */}
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Documents</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={application?.profilePicture?._id
                  ? `/api/onboarding/documents/${application.profilePicture._id}?inline=1`
                  : undefined}
                sx={{ width: 72, height: 72, bgcolor: '#f5e9d5' }}
              >
                <PersonIcon sx={{ color: '#8a6a2f', fontSize: 36 }} />
              </Avatar>
              <DocumentUploader
                label="Upload profile picture"
                accept="image/*"
                disabled={readOnly}
                onUpload={(f) => handleUpload('profile_picture', f)}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DocumentUploader
                label="Upload driver's license"
                accept=".pdf,image/*"
                disabled={readOnly}
                onUpload={(f) => handleUpload('drivers_license', f)}
              />
              <DocumentUploader
                label="Upload work authorization"
                accept=".pdf,image/*"
                disabled={readOnly}
                onUpload={(f) => handleUpload('work_authorization', f)}
              />
              {isOPT && (
                <DocumentUploader
                  label="Upload OPT Receipt"
                  accept=".pdf,image/*"
                  disabled={readOnly}
                  onUpload={(f) => handleUpload('opt_receipt', f)}
                />
              )}
            </Stack>

            {application?.documents?.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {application.documents.map((d) => (
                  <Stack key={d._id || d.id} direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" sx={{ minWidth: 180, color: 'text.secondary' }}>
                      {d.kind}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>{d.originalName}</Typography>
                    <Button
                      size="small"
                      component="a"
                      href={`/api/onboarding/documents/${d._id}?inline=1`}
                      target="_blank"
                      rel="noopener"
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      component="a"
                      href={`/api/onboarding/documents/${d._id}`}
                    >
                      Download
                    </Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>

          <Divider />

          <FormProvider {...methods}>
            <Box component="form" onSubmit={methods.handleSubmit(onSubmit)}>
              <Stack spacing={4} divider={<Divider flexItem />}>
                <NameSection readOnly={readOnly} />
                <AddressSection readOnly={readOnly} />
                <ContactSection readOnly={readOnly} />
                <EmploymentSection readOnly={readOnly} />
                <ReferenceSection readOnly={readOnly} />
                <EmergencyContactSection readOnly={readOnly} />
              </Stack>

              {!readOnly && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading === 'loading'}
                  >
                    {status === 'rejected' ? 'Resubmit application' : 'Submit application'}
                  </Button>
                </Stack>
              )}
            </Box>
          </FormProvider>
        </Stack>
      </Paper>
    </Box>
  );
}
