import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  Stack, TextField, Typography, MenuItem,
  RadioGroup, Radio, FormControlLabel, FormLabel,
} from '@mui/material';

const VISA_TYPES = ['H1-B', 'L2', 'F1', 'H4', 'Other'];

export default function EmploymentSection({ readOnly = false }) {
  const { register, watch, control, formState: { errors } } = useFormContext();
  const isCitizenOrPR = watch('isCitizenOrPR');
  const visaType = watch('workAuthorization.type');

  return (
    <Stack spacing={2.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Work authorization</Typography>

      <FormLabel sx={{ fontSize: 13, color: 'text.secondary' }}>
        Permanent resident or citizen of the U.S.? *
      </FormLabel>
      <Controller
        name="isCitizenOrPR"
        control={control}
        rules={{ validate: (v) => v !== undefined && v !== '' || 'Required' }}
        render={({ field }) => (
          <RadioGroup
            row
            value={field.value === undefined ? '' : String(field.value)}
            onChange={(e) => field.onChange(e.target.value === 'true')}
          >
            <FormControlLabel value="true" control={<Radio />} disabled={readOnly} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} disabled={readOnly} label="No" />
          </RadioGroup>
        )}
      />

      {isCitizenOrPR === true && (
        <TextField
          select
          label="Residency type *"
          disabled={readOnly}
          defaultValue=""
          sx={{ maxWidth: 280 }}
          {...register('residencyType', {
            required: isCitizenOrPR === true ? 'Required' : false,
          })}
          error={Boolean(errors.residencyType)}
          helperText={errors.residencyType?.message}
        >
          <MenuItem value="">—</MenuItem>
          <MenuItem value="green_card">Green Card</MenuItem>
          <MenuItem value="citizen">Citizen</MenuItem>
        </TextField>
      )}

      {isCitizenOrPR === false && (
        <Stack spacing={2}>
          <TextField
            select
            label="Visa type *"
            disabled={readOnly}
            defaultValue=""
            sx={{ maxWidth: 280 }}
            {...register('workAuthorization.type', {
              required: isCitizenOrPR === false ? 'Required' : false,
            })}
            error={Boolean(errors.workAuthorization?.type)}
            helperText={errors.workAuthorization?.type?.message}
          >
            <MenuItem value="">—</MenuItem>
            {VISA_TYPES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>

          {visaType === 'Other' && (
            <TextField
              label="Visa title *"
              disabled={readOnly}
              sx={{ maxWidth: 280 }}
              {...register('workAuthorization.otherTitle', {
                required: visaType === 'Other' ? 'Required' : false,
              })}
              error={Boolean(errors.workAuthorization?.otherTitle)}
              helperText={errors.workAuthorization?.otherTitle?.message}
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Start date"
              type="date"
              fullWidth
              disabled={readOnly}
              InputLabelProps={{ shrink: true }}
              {...register('workAuthorization.startDate')}
            />
            <TextField
              label="End date"
              type="date"
              fullWidth
              disabled={readOnly}
              InputLabelProps={{ shrink: true }}
              {...register('workAuthorization.endDate')}
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
