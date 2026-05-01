import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Stack, TextField, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, Link, TablePagination,
} from '@mui/material';

import * as hrApi from '../../api/hrApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function EmployeeProfilesPage() {
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);          // MUI is 0-based; backend is 1-based
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployees = useCallback(async (q, p, l) => {
    setLoading(true);
    try {
      const { data } = await hrApi.listEmployees({
        search: q,
        page: p + 1,
        limit: l,
      });
      setEmployees(data.employees || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search — also resets to page 0 on every search change.
  useEffect(() => {
    const t = setTimeout(() => fetchEmployees(search, 0, limit), 300);
    setPage(0);
    return () => clearTimeout(t);
  }, [search, limit, fetchEmployees]);

  // Plain page changes — re-fetch immediately.
  useEffect(() => {
    if (page === 0) return; // first page already covered by the search effect
    fetchEmployees(search, page, limit);
    // eslint-disable-next-line
  }, [page]);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Employee Profiles{' '}
            <Typography component="span" color="text.secondary" variant="body1">
              · {total} total
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sorted alphabetically by last name. Click a name to open the full profile.
          </Typography>
        </Box>

        <TextField
          placeholder="Search by first, last, or preferred name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }} elevation={1}>
          {loading ? (
            <LoadingSpinner />
          ) : employees.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {search ? 'No employees match your search.' : 'No approved employees yet.'}
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SSN</TableCell>
                  <TableCell>Work auth</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>
                      <Link
                        href={`/hr/employees/${e.userId}`}
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                      >
                        {e.fullName}
                      </Link>
                    </TableCell>
                    <TableCell>{maskSSN(e.ssn)}</TableCell>
                    <TableCell>{e.workAuthTitle || '—'}</TableCell>
                    <TableCell>{e.phone}</TableCell>
                    <TableCell>{e.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && employees.length > 0 && (
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_e, newPage) => setPage(newPage)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => setLimit(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )}
        </Paper>
      </Stack>
    </Box>
  );
}

function maskSSN(ssn) {
  if (!ssn) return '—';
  const digits = ssn.replace(/\D/g, '');
  if (digits.length < 4) return ssn;
  return `•••-••-${digits.slice(-4)}`;
}
