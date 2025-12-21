import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";

import { API_BASE_URL } from "../config";

export default function VehicleDashboard() {
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    // 🔹 Health check
    try {
      await axios.get(`${API_BASE_URL}/api/health`);
    } catch {
      setError("Backend not reachable");
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/summary`);
      setSummary(res.data);
    } catch {
      setSummary({});
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/inventory`);
      setInventory(res.data);
    } catch {
      setInventory({});
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/bookings`);
      setBookings(res.data);
    } catch {
      setBookings({});
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/service-status`);
      setServiceStatus(res.data);
    } catch {
      setServiceStatus({});
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/alerts`);
      setAlerts(res.data);
    } catch {
      setAlerts({});
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!summary || !inventory || !bookings || !serviceStatus || !alerts) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Vehicle Dashboard
      </Typography>

      <Grid container spacing={2}>
        <DashboardCard title="Total Vehicles Sold" value={summary.totalVehiclesSold || 0} />
        <DashboardCard title="Total Revenue" value={summary.totalRevenue || 0} />
        <DashboardCard title="Pending Deliveries" value={summary.pendingDeliveries || 0} />
        <DashboardCard title="Active Sub Dealers" value={summary.activeSubDealers || 0} />
        <DashboardCard title="Pending Maintenance" value={summary.pendingMaintenance || 0} />
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6">Inventory Level</Typography>
      <Grid container spacing={2} mt={1}>
        <DashboardCard
          title="Total Vehicles In Stock"
          value={inventory.totalVehiclesInStock || 0}
        />
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6">Booking Overview</Typography>
      <Grid container spacing={2} mt={1}>
        <DashboardCard title="Daily" value={bookings.daily || 0} />
        <DashboardCard title="Weekly" value={bookings.weekly || 0} />
        <DashboardCard title="Monthly" value={bookings.monthly || 0} />
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6">Service & Maintenance</Typography>
      <Grid container spacing={2} mt={1}>
        <DashboardCard title="Pending" value={serviceStatus.Pending || 0} />
        <DashboardCard title="In Progress" value={serviceStatus["In Progress"] || 0} />
        <DashboardCard title="Completed" value={serviceStatus.Completed || 0} />
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6">Alerts & Risk</Typography>
      <Grid container spacing={2} mt={1}>
        <DashboardCard
          title="Vehicles Not Sold (60+ Days)"
          value={alerts.unsoldOver60Days || 0}
          color="error"
        />
      </Grid>
    </Box>
  );
}

function DashboardCard({ title, value, color = "primary" }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        sx={{
          p: 2,
          textAlign: "center",
          borderTop: "4px solid",
          borderColor: color === "error" ? "error.main" : "primary.main",
        }}
      >
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="h6">{value}</Typography>
      </Paper>
    </Grid>
  );
}
