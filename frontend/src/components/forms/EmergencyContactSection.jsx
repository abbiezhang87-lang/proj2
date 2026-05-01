import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  Stack, TextField, Typography, Button, Paper, IconButton,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';

// 1+ emergency contacts. Adds + removes via useFieldArray.
export default function EmergencyContactSection({ readOnly = false }) {
  const { register, control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'emergencyContacts' });

  const e = (i, k) => errors.emergencyContacts?.[i]?.[k];

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Emergency contacts <Typography component="span" variant="caption" color="text.secondary">(at least one)</Typography>
      </Typography>

      {fields.map((field, idx) => (
        <Paper key={field.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
          {!readOnly && fields.length > 1 && (
            <IconButton
              size="small"
              onClick={() => remove(idx)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
              aria-label="Remove contact"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First name *"
                fullWidth
                disabled={readOnly}
                error={Boolean(e(idx, 'firstName'))}
                helperText={e(idx, 'firstName')?.message}
                {...register(`emergencyContacts.${idx}.firstName`, { required: 'Required' })}
              />
              <TextField
                label="Last name *"
                fullWidth
                disabled={readOnly}
                error={Boolean(e(idx, 'lastName'))}
                helperText={e(idx, 'lastName')?.message}
                {...register(`emergencyContacts.${idx}.lastName`, { required: 'Required' })}
              />
              <TextField
                label="Middle"
                fullWidth
                disabled={readOnly}
                {...register(`emergencyContacts.${idx}.middleName`)}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Phone"
                fullWidth
                disabled={readOnly}
                {...register(`emergencyContacts.${idx}.phone`)}
              />
              <TextField
                label="Email"
                fullWidth
                disabled={readOnly}
                {...register(`emergencyContacts.${idx}.email`)}
              />
              <TextField
                label="Relationship *"
                fullWidth
                disabled={readOnly}
                error={Boolean(e(idx, 'relationship'))}
                helperText={e(idx, 'relationship')?.message}
                {...register(`emergencyContacts.${idx}.relationship`, { required: 'Required' })}
              />
            </Stack>
          </Stack>
        </Paper>
      ))}

      {!readOnly && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => append({ firstName: '', lastName: '', relationship: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add emergency contact
        </Button>
      )}
    </Stack>
  );
}
