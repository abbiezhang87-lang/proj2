import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import api from '../../api/axiosInstance';

// Hook for displaying images that live behind auth-gated endpoints (e.g. the
// employee's profile picture). Returns a blob URL once fetched, or null.
export function useAuthBlobUrl(path) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!path) { setUrl(null); return undefined; }
    let cancelled = false;
    let blobUrl = null;
    api.get(path, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(new Blob([res.data]));
        setUrl(blobUrl);
      })
      .catch(() => { /* silent — Avatar falls back to its child icon */ });
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [path]);
  return url;
}

// JWT lives in localStorage and is attached by the axios interceptor —
// a plain <a target="_blank"> won't carry it and the backend returns 401.
// These two buttons fetch the file via axios (so the JWT travels with the
// request), turn the response into an object URL, and either open it in a
// new tab (Preview) or trigger a browser download (Download).

async function fetchBlobUrl(path) {
  const res = await api.get(path, { responseType: 'blob' });
  const type = res.headers['content-type'] || 'application/octet-stream';
  const blob = new Blob([res.data], { type });
  return URL.createObjectURL(blob);
}

export function PreviewButton({ path, size = 'small', ...rest }) {
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const url = await fetchBlobUrl(path);
      window.open(url, '_blank');
      // Free the object URL after the new tab has had a chance to load it.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (_e) {
      // No-op — caller surface its own error UI if it wants.
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button size={size} onClick={onClick} disabled={busy} {...rest}>
      {busy ? 'Loading…' : 'Preview'}
    </Button>
  );
}

export function DownloadButton({ path, filename, size = 'small', ...rest }) {
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const url = await fetchBlobUrl(path);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
    } catch (_e) {
      // ditto
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button size={size} onClick={onClick} disabled={busy} {...rest}>
      {busy ? '…' : 'Download'}
    </Button>
  );
}
