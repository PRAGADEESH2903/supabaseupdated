// ServiceDetails.js
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  MenuItem,
  Alert,
  Autocomplete,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from "../config";



const validationSchema = Yup.object({
  vehicle_id: Yup.number()
    .typeError('Vehicle is required')
    .required('Vehicle is required'),
  service_count: Yup.number()
    .typeError('Service count is required')
    .required('Service count is required')
    .min(1, 'Service count must be at least 1'),
  status: Yup.string().required('Status is required'),
  date: Yup.string().required('Service date is required'),
});

const ServiceDetails = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH VEHICLES =================
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/vehicles`);
        setVehicles(res.data || []);
      } catch (err) {
        setError('Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // ================= FORMIK =================
  const formik = useFormik({
    initialValues: {
      vehicle_id: null,
      service_count: '',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError(null);

        await axios.post(`${API_BASE_URL}/api/services`, {
          vehicle_id: Number(values.vehicle_id),
          service_count: Number(values.service_count),
          status: values.status, // Capitalized
          date: values.date,
          remarks: values.remarks,
        });

        resetForm();
        navigate('/dealers');
      } catch (err) {
        setError(
          err.response?.data?.error || 'Failed to submit service details'
        );
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Service Details
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* VEHICLE */}
              <Grid item xs={12}>
                <Autocomplete
                  options={vehicles}
                  loading={loading}
                  getOptionLabel={(option) =>
                    `${option.name} - ${option.model}`
                  }
                  value={
                    vehicles.find(
                      (v) => v.id === formik.values.vehicle_id
                    ) || null
                  }
                  onChange={(e, newValue) =>
                    formik.setFieldValue(
                      'vehicle_id',
                      newValue ? newValue.id : null
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Vehicle"
                      error={
                        formik.touched.vehicle_id &&
                        Boolean(formik.errors.vehicle_id)
                      }
                      helperText={
                        formik.touched.vehicle_id &&
                        formik.errors.vehicle_id
                      }
                    />
                  )}
                />
              </Grid>

              {/* SERVICE COUNT */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Service Count"
                  name="service_count"
                  type="number"
                  value={formik.values.service_count}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.service_count &&
                    Boolean(formik.errors.service_count)
                  }
                  helperText={
                    formik.touched.service_count &&
                    formik.errors.service_count
                  }
                />
              </Grid>

              {/* STATUS */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              {/* SERVICE DATE */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Service Date"
                  name="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.date}
                  onChange={formik.handleChange}
                />
              </Grid>

              {/* SERVICE TYPE DISPLAY */}
              <Grid item xs={12}>
                <Chip
                  label={
                    Number(formik.values.service_count) <= 6
                      ? 'FREE SERVICE'
                      : 'PAID SERVICE'
                  }
                  color={
                    Number(formik.values.service_count) <= 6
                      ? 'success'
                      : 'warning'
                  }
                />
              </Grid>

              {/* REMARKS */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  multiline
                  rows={2}
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={formik.isSubmitting}
              >
                Submit & Continue
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ServiceDetails;
