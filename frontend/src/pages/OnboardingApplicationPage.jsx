import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Box, Paper, Typography, Stack, Button, Alert, Chip, Divider, Avatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

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
import {
  PreviewButton, DownloadButton, useAuthBlobUrl,
} from '../components/documents/DocumentActions';
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
  }, [application, user?.email]);  // eslint-disable-line

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

          {/* Documents — uniform row-per-file layout */}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Documents</Typography>

            <DocumentRow
              kind="profile_picture"
              label="Profile picture"
              accept="image/*"
              avatar
              uploaded={application?.profilePicture}
              readOnly={readOnly}
              onUpload={handleUpload}
            />
            <DocumentRow
              kind="drivers_license"
              label="Driver's license"
              accept=".pdf,image/*"
              uploaded={(application?.documents || []).find((d) => d.kind === 'drivers_license')}
              readOnly={readOnly}
              onUpload={handleUpload}
            />
            <DocumentRow
              kind="work_authorization"
              label="Work authorization"
              accept=".pdf,image/*"
              uploaded={(application?.documents || []).find((d) => d.kind === 'work_authorization')}
              readOnly={readOnly}
              onUpload={handleUpload}
            />
            {isOPT && (
              <DocumentRow
                kind="opt_receipt"
                label="OPT Receipt"
                accept=".pdf,image/*"
                uploaded={(application?.documents || []).find((d) => d.kind === 'opt_receipt')}
                readOnly={readOnly}
                onUpload={handleUpload}
              />
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

// One uniform row per document kind: thumbnail / icon · label · status · upload + preview/download.
function DocumentRow({
  kind, label, accept, avatar = false, uploaded, readOnly, onUpload,
}) {
  // Profile picture renders as an actual <img> via blob URL — img tags don't
  // send the JWT on their own, so we fetch with axios and stuff the result in.
  const profileBlobUrl = useAuthBlobUrl(
    avatar && uploaded?._id ? `/onboarding/documents/${uploaded._id}` : null
  );

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        p: 1.5,
        bgcolor: '#faf8f4',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {avatar ? (
        <Avatar
          src={profileBlobUrl || undefined}
          sx={{ width: 56, height: 56, bgcolor: '#f5e9d5' }}
        >
          <PersonIcon sx={{ color: '#8a6a2f', fontSize: 28 }} />
        </Avatar>
      ) : (
        <Avatar sx={{ width: 56, height: 56, bgcolor: '#eef0eb' }}>
          <InsertDriveFileIcon sx={{ color: '#6b8e7f' }} />
        </Avatar>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
        <Typography
          variant="caption"
          color={uploaded ? 'text.secondary' : 'text.disabled'}
          noWrap
          sx={{ display: 'block' }}
        >
          {uploaded ? uploaded.originalName : 'Not uploaded'}
        </Typography>
      </Box>

      {uploaded?._id && (
        <Stack direction="row" spacing={0.5}>
          <PreviewButton path={`/onboarding/documents/${uploaded._id}`} />
          <DownloadButton
            path={`/onboarding/documents/${uploaded._id}`}
            filename={uploaded.originalName}
          />
        </Stack>
      )}

      <DocumentUploader
        label={uploaded ? 'Replace' : 'Upload'}
        accept={accept}
        disabled={readOnly}
        onUpload={(f) => onUpload(kind, f)}
      />
    </Stack>
  );
}
