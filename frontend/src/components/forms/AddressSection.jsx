import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Stack, TextField, Typography } from '@mui/material';

export default function AddressSection({ readOnly = false }) {
  const { register, formState: { errors } } = useFormContext();
  const a = (k) => errors.address?.[k];

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Current address</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Building / Apt # *"
          fullWidth
          disabled={readOnly}
          error={Boolean(a('building'))}
          helperText={a('building')?.message}
          {...register('address.building', { required: 'Required' })}
        />
        <TextField
          label="Street *"
          fullWidth
          disabled={readOnly}
          error={Boolean(a('street'))}
          helperText={a('street')?.message}
          {...register('address.street', { required: 'Required' })}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="City *"
          fullWidth
          disabled={readOnly}
          error={Boolean(a('city'))}
          helperText={a('city')?.message}
          {...register('address.city', { required: 'Required' })}
        />
        <TextField
          label="State *"
          fullWidth
          disabled={readOnly}
          error={Boolean(a('state'))}
          helperText={a('state')?.message}
          {...register('address.state', { required: 'Required' })}
        />
        <TextField
          label="Zip *"
          fullWidth
          disabled={readOnly}
          error={Boolean(a('zip'))}
          helperText={a('zip')?.message}
          {...register('address.zip', {
            required: 'Required',
            pattern: { value: /^\d{5}(-\d{4})?$/, message: 'Invalid zip' },
          })}
        />
      </Stack>
    </Stack>
  );
}
