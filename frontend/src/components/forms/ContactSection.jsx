import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Stack, TextField, Typography, MenuItem,
} from '@mui/material';

const PHONE_RE = /^\+?[\d\s\-().]{7,}$/;

export default function ContactSection({ readOnly = false, lockEmail = true }) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Contact & identity</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Cell phone *"
          fullWidth
          disabled={readOnly}
          error={Boolean(errors.cellPhone)}
          helperText={errors.cellPhone?.message}
          {...register('cellPhone', {
            required: 'Required',
            pattern: { value: PHONE_RE, message: 'Invalid phone' },
          })}
        />
        <TextField
          label="Work phone"
          fullWidth
          disabled={readOnly}
          {...register('workPhone')}
        />
        <TextField
          label="Email"
          fullWidth
          disabled={readOnly || lockEmail}
          {...register('email')}
        />
      </Stack>

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
    </Stack>
  );
}
