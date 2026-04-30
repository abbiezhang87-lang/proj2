import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Stack, TextField, Typography } from '@mui/material';

export default function NameSection({ readOnly = false }) {
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
    </Stack>
  );
}
