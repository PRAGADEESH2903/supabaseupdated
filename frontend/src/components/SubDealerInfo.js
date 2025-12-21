import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from "@mui/material";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://supabaseupdated.onrender.com";


const SubDealerInfo = () => {
  const [dealers, setDealers] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchDealers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sub-dealers`);
      setDealers(res.data || []);
    } catch (err) {
      setError("Failed to fetch dealers");
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);

      await axios.post(`${API_BASE_URL}/api/sub-dealers`, {
        name,
        location,
      });

      setSuccess("Dealer added successfully");
      setName("");
      setLocation("");
      fetchDealers();
    } catch (err) {
      setError("Failed to add dealer");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sub Dealer Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dealer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSubmit}>
              Add Dealer
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Existing Dealers</Typography>
        {dealers.map((d) => (
          <Typography key={d.id}>
            {d.name} – {d.location}
          </Typography>
        ))}
      </Paper>
    </Box>
  );
};

export default SubDealerInfo;
