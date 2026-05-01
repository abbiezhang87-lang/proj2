import React, { useRef, useState } from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Reusable file picker that wraps a hidden <input type="file">.
// Calls onUpload(file) when the user picks one.
//
// Props:
//   accept     — MIME or extension filter (default: PDF + common images)
//   label      — button label (default "Upload file")
//   onUpload   — async function(file). If it throws, error is shown.
export default function DocumentUploader({
  accept = '.pdf,image/*',
  label = 'Upload file',
  onUpload,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filename, setFilename] = useState('');

  const handlePick = () => inputRef.current?.click();

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      await onUpload(file);
      setFilename(file.name);
    } catch (err) {
      setError(err?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          variant="outlined"
          size="small"
          startIcon={<UploadFileIcon />}
          onClick={handlePick}
          disabled={disabled || busy}
        >
          {busy ? 'Uploading…' : label}
        </Button>
        {filename && !error && (
          <Typography variant="caption" color="text.secondary">{filename}</Typography>
        )}
      </Stack>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
