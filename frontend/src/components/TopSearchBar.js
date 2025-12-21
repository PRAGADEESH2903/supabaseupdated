import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

// ✅ Central API base URL
import { API_BASE_URL } from "../config";

// Order: Customers → Vehicles → Services → Dealers → Purchases
const navItems = [
  { to: "/customers", label: "Customers" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/services", label: "Services" },
  { to: "/dealers", label: "Dealers" },
  { to: "/purchases", label: "Purchases" },
];

const searchTypes = [
  { value: "customer", label: "Customer" },
  { value: "vehicle", label: "Vehicle" },
  { value: "service", label: "Service" },
  { value: "purchase", label: "Purchase" },
  { value: "sub-dealer", label: "Dealer" },
];

const TopSearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [type, setType] = useState("customer");

  /* ---------------- BACKEND HEALTH CHECK (SAFE) ---------------- */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/health`)
      .catch(() => {
        // ❗ Do NOT crash UI if backend is down
        console.warn("Backend not reachable");
      });
  }, []);

  const doSearch = () => {
    const q = (query || "").trim();
    navigate(`/search?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: "inherit", textDecoration: "none" }}
          >
            Showroom
          </Typography>

          {navItems.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              color={location.pathname === item.to ? "secondary" : "inherit"}
              sx={{ textTransform: "none" }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            select
            value={type}
            onChange={(e) => setType(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: 140, bgcolor: "primary.light" }}
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
            sx={{
              minWidth: 260,
              bgcolor: "primary.main",
              "& .MuiInputBase-root": { bgcolor: "primary.light" },
            }}
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
            sx={{ color: "inherit" }}
            aria-label="filter"
            onClick={doSearch}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopSearchBar;
