import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Stack, TextField, Typography, MenuItem } from '@mui/material';

// `withIdentity` adds spec §5.b iii–iv (email + SSN/DOB/gender) so this section
// can stand in as the full "Name" panel on the Personal Information page.
// Onboarding keeps the lighter version (just the name fields).
export default function NameSection({ readOnly = false, withIdentity = false }) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Name</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="First name *"
          fullWidth
          disabled={readOnly}
          error={Boolean(errors.firstName)}
          helperText={errors.firstName?.message}
          {...register('firstName', { required: 'Required' })}
        />
        <TextField
          label="Last name *"
          fullWidth
          disabled={readOnly}
          error={Boolean(errors.lastName)}
          helperText={errors.lastName?.message}
          {...register('lastName', { required: 'Required' })}
        />
        <TextField
          label="Middle name"
          fullWidth
          disabled={readOnly}
          {...register('middleName')}
        />
      </Stack>
      <TextField
        label="Preferred name"
        fullWidth
        disabled={readOnly}
        {...register('preferredName')}
      />

      {withIdentity && (
        <>
          <TextField
            label="Email"
            fullWidth
            disabled
            {...register('email')}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="SSN *"
              fullWidth
              disabled={readOnly}
              error={Boolean(errors.ssn)}
              helperText={errors.ssn?.message}
              {...register('ssn', {
                required: 'Required',
                pattern: { value: /^\d{3}-?\d{2}-?\d{4}$/, message: '###-##-####' },
              })}
            />
            <TextField
              label="Date of birth *"
              type="date"
              fullWidth
              disabled={readOnly}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.dob)}
              helperText={errors.dob?.message}
              {...register('dob', { required: 'Required' })}
            />
            <TextField
              select
              label="Gender *"
              fullWidth
              disabled={readOnly}
              defaultValue=""
              error={Boolean(errors.gender)}
              helperText={errors.gender?.message}
              {...register('gender', { required: 'Required' })}
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="no_answer">Prefer not to say</MenuItem>
            </TextField>
          </Stack>
        </>
      )}
    </Stack>
  );
}
