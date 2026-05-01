import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Stack, TextField, Typography } from '@mui/material';

// Reference (single, optional whole-section but if present these fields are required)
export default function ReferenceSection({ readOnly = false }) {
  const { register, formState: { errors } } = useFormContext();
  const r = (k) => errors.reference?.[k];

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Reference <Typography component="span" variant="caption" color="text.secondary">(who referred you?)</Typography>
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="First name *"
          fullWidth
          disabled={readOnly}
          error={Boolean(r('firstName'))}
          helperText={r('firstName')?.message}
          {...register('reference.firstName', { required: 'Required' })}
        />
        <TextField
          label="Last name *"
          fullWidth
          disabled={readOnly}
          error={Boolean(r('lastName'))}
          helperText={r('lastName')?.message}
          {...register('reference.lastName', { required: 'Required' })}
        />
        <TextField
          label="Middle"
          fullWidth
          disabled={readOnly}
          {...register('reference.middleName')}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Phone"
          fullWidth
          disabled={readOnly}
          {...register('reference.phone')}
        />
        <TextField
          label="Email"
          fullWidth
          disabled={readOnly}
          {...register('reference.email')}
        />
        <TextField
          label="Relationship *"
          fullWidth
          disabled={readOnly}
          error={Boolean(r('relationship'))}
          helperText={r('relationship')?.message}
          {...register('reference.relationship', { required: 'Required' })}
        />
      </Stack>
    </Stack>
  );
}
