import React, { useEffect, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
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
} from "@mui/material";
import { API_BASE_URL } from "../config";

/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  vehicle_id: Yup.number().required("Vehicle is required"),
  service_count: Yup.number()
    .required("Service count required")
    .min(1, "Minimum 1"),
  status: Yup.string().required("Status required"),
  date: Yup.string().required("Date required"),
});

const ServiceDetails = () => {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /* ===== FETCH VEHICLES ===== */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/vehicles`)
      .then((res) => setVehicles(res.data))
      .catch(() => setError("Failed to load vehicles"));
  }, []);

  const formik = useFormik({
    initialValues: {
      vehicle_id: "",
      service_count: "",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      remarks: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError(null);
        setSuccess(false);

        const payload = {
          vehicle_id: Number(values.vehicle_id),
          service_count: Number(values.service_count),
          status: values.status,
          date: values.date,
          remarks: values.remarks,
        };

        console.log("Submitting service:", payload);

        await axios.post(`${API_BASE_URL}/api/services`, payload);

        setSuccess(true);
        resetForm();
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error || "Failed to submit service"
        );
      }
    },
  });

  const serviceType =
    Number(formik.values.service_count) <= 6 ? "FREE" : "PAID";

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Service Details
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">Service added successfully</Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>

              {/* VEHICLE */}
              <Grid item xs={12}>
                <Autocomplete
                  options={vehicles}
                  getOptionLabel={(v) =>
                    `${v.name} - ${v.model}`
                  }
                  onChange={(_, value) =>
                    formik.setFieldValue(
                      "vehicle_id",
                      value ? value.id : ""
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
                  type="number"
                  label="Service Count"
                  {...formik.getFieldProps("service_count")}
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
                  select
                  fullWidth
                  label="Status"
                  {...formik.getFieldProps("status")}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </TextField>
              </Grid>

              {/* DATE */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Service Date"
                  InputLabelProps={{ shrink: true }}
                  {...formik.getFieldProps("date")}
                />
              </Grid>

              {/* SERVICE TYPE DISPLAY */}
              <Grid item xs={12}>
                <Chip
                  label={`${serviceType} SERVICE`}
                  color={serviceType === "FREE" ? "success" : "warning"}
                />
              </Grid>

              {/* REMARKS */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  {...formik.getFieldProps("remarks")}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={formik.isSubmitting}
                >
                  Submit Service
                </Button>
              </Grid>

            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ServiceDetails;
