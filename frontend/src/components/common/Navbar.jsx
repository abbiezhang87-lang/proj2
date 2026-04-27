import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, Typography } from '@mui/material';

import {
  selectIsAuthenticated,
  selectRole,
  logout,
} from '../../store/slices/authSlice';

const employeeLinks = [
  { to: '/personal-info', label: 'Personal Info' },
  { to: '/visa-status', label: 'Visa Status' },
];

const hrLinks = [
  { to: '/', label: 'Home' },
  { to: '/hr/employees', label: 'Employee Profiles' },
  { to: '/hr/visa', label: 'Visa Status' },
  { to: '/hr/hiring', label: 'Hiring' },
];

const linkSx = {
  color: 'text.secondary',
  textDecoration: 'none',
  px: 1.5,
  py: 0.5,
  fontSize: 14,
  fontWeight: 500,
  '&.active': { color: 'text.primary', borderBottom: '2px solid', borderColor: 'primary.main' },
};

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);

  if (!isAuth) return null;

  const links = role === 'hr' ? hrLinks : employeeLinks;

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: 'primary.main', mr: 2 }}
        >
          Greenhouse HR
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {links.map(({ to, label }) => (
            <Box
              key={to}
              component={NavLink}
              to={to}
              end={to === '/'}
              sx={linkSx}
            >
              {label}
            </Box>
          ))}
        </Box>

        <Button onClick={handleLogout} size="small">Log out</Button>
      </Toolbar>
    </AppBar>
  );
}
