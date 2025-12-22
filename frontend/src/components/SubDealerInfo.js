import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import { API_BASE_URL } from "../config";

const SubDealerInfo = () => {
  const [dealers, setDealers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    dealer_code: "",
    name: "",
    contact: "",
    location: "",
  });

  /* ================= FETCH DEALERS ================= */
  const fetchDealers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sub-dealers`);
      setDealers(res.data);
    } catch {
      setError("Failed to fetch dealers");
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (
        !form.dealer_code ||
        !form.name ||
        !form.contact ||
        !form.location
      ) {
        setError("All fields are required");
        return;
      }

      await axios.post(`${API_BASE_URL}/api/sub-dealers`, form);

      setSuccess("Dealer added successfully");
      setForm({
        dealer_code: "",
        name: "",
        contact: "",
        location: "",
      });

      fetchDealers();
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to add dealer"
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Sub Dealer Information
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* ================= FORM ================= */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Dealer Code"
              name="dealer_code"
              value={form.dealer_code}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Dealer Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSubmit}>
              Add Dealer
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ================= DEALER LIST ================= */}
      <Typography variant="h6">Existing Dealers</Typography>

      {dealers.map((d) => (
        <Paper key={d.id} sx={{ p: 2, mt: 1 }}>
          <strong>{d.name}</strong> — {d.location}  
          <br />
          📞 {d.contact} | Code: {d.dealer_code}
        </Paper>
      ))}
    </Box>
  );
};

export default SubDealerInfo;
