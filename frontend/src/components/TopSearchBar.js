// TopSearchBar.js
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { API_BASE_URL } from "../config";
axios.get(`${API_BASE_URL}/api/health`);


// Order: Customers → Vehicles → Services → Dealers → Purchases
const navItems = [
  { to: '/customers', label: 'Customers' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/services', label: 'Services' },
  { to: '/dealers', label: 'Dealers' },
  { to: '/purchases', label: 'Purchases' },
];

const searchTypes = [
  { value: 'customer', label: 'Customer' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'service', label: 'Service' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'sub-dealer', label: 'Dealer' },
];

const TopSearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('customer');

  const doSearch = () => {
    const q = (query || '').trim();
    // Navigate only when query exists (you can change to allow empty if needed)
    if (q.length > 0) {
      navigate(`/search?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`);
    } else {
      // optional: navigate to search page with only type
      navigate(`/search?type=${encodeURIComponent(type)}&q=`);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none' }}
          >
            Showroom
          </Typography>

          {navItems.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              color={location.pathname === item.to ? 'secondary' : 'inherit'}
              sx={{ textTransform: 'none' }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            select
            value={type}
            onChange={(e) => setType(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: 140, bgcolor: 'primary.light' }}
          >
            {searchTypes.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            sx={{ minWidth: 260, bgcolor: 'primary.main', '& .MuiInputBase-root': { bgcolor: 'primary.light' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={doSearch} aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <IconButton
            sx={{ color: 'inherit' }}
            aria-label="filter"
            onClick={() => {
              // optional: open filter drawer (not implemented)
              // For now, quick visual feedback:
              // navigate to search page with current values
              navigate(`/search?type=${encodeURIComponent(type)}&q=${encodeURIComponent(query)}`);
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopSearchBar;
