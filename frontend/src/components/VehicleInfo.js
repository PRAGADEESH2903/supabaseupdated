import React, { useEffect, useState } from "react";
import axios from "axios";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Autocomplete,
} from "@mui/material";
import { API_BASE_URL } from "../config";

/* ================= VALIDATION ================= */

const eightDigit = Yup.string()
  .matches(/^\d{8}$/, "Must be exactly 8 digits")
  .required("Required");

const validationSchema = Yup.object({
  customer: Yup.object().required("Customer is required"),
  name: Yup.string().required("Vehicle name is required"),
  model: Yup.string().required("Model is required"),
  year: Yup.number()
    .required("Manufacture year is required")
    .min(1900, "Invalid year")
    .max(new Date().getFullYear(), "Future year not allowed"),
  engine_no: eightDigit,
  chassis_no: eightDigit,
  gearbox_no: eightDigit,
  battery_no: eightDigit,
  tire_front: eightDigit,
  tire_rear_left: eightDigit,
  tire_rear_right: eightDigit,
  tire_stepney: eightDigit,
  price: Yup.number().required("Price is required").min(0),
});

/* ================= COMPONENT ================= */

const VehicleInfo = () => {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /* ===== FETCH CUSTOMERS ===== */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/customers`)
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Failed to load customers"));
  }, []);

  /* ================= FORM ================= */

  const formik = useFormik({
    initialValues: {
      customer: null,
      name: "",
      model: "",
      year: "",
      engine_no: "",
      chassis_no: "",
      gearbox_no: "",
      battery_no: "",
      tire_front: "",
      tire_rear_left: "",
      tire_rear_right: "",
      tire_stepney: "",
      price: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError(null);
        setSuccess(false);

        const payload = {
          name: values.name,
          model: values.model,
          year: Number(values.year),
          engine_no: values.engine_no,
          chassis_no: values.chassis_no,
          gearbox_no: values.gearbox_no,
          battery_no: values.battery_no,
          tire_front: values.tire_front,
          tire_rear_left: values.tire_rear_left,
          tire_rear_right: values.tire_rear_right,
          tire_stepney: values.tire_stepney,
          price: Number(values.price),
          customer_id: values.customer.id,
        };

        await axios.post(`${API_BASE_URL}/api/vehicles`, payload);

        setSuccess(true);
        resetForm();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to submit vehicle");
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Vehicle Information
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Vehicle added successfully
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* CUSTOMER */}
              <Grid item xs={12}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(c) => `${c.name} - ${c.contact}`}
                  onChange={(_, value) =>
                    formik.setFieldValue("customer", value)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Customer"
                      error={
                        formik.touched.customer &&
                        Boolean(formik.errors.customer)
                      }
                      helperText={
                        formik.touched.customer && formik.errors.customer
                      }
                    />
                  )}
                />
              </Grid>

              {/* BASIC INFO */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Name"
                  {...formik.getFieldProps("name")}
                  error={
                    formik.touched.name && Boolean(formik.errors.name)
                  }
                  helperText={
                    formik.touched.name && formik.errors.name
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  {...formik.getFieldProps("model")}
                  error={
                    formik.touched.model && Boolean(formik.errors.model)
                  }
                  helperText={
                    formik.touched.model && formik.errors.model
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Manufacture Year"
                  {...formik.getFieldProps("year")}
                  error={
                    formik.touched.year && Boolean(formik.errors.year)
                  }
                  helperText={
                    formik.touched.year && formik.errors.year
                  }
                />
              </Grid>

              {/* PRICE */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  {...formik.getFieldProps("price")}
                  error={
                    formik.touched.price && Boolean(formik.errors.price)
                  }
                  helperText={
                    formik.touched.price && formik.errors.price
                  }
                />
              </Grid>

              {/* SUBMIT */}
              <Grid item xs={12}>
                <Button variant="contained" type="submit" fullWidth>
                  Add Vehicle
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default VehicleInfo;
