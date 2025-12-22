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
  Alert,
  Autocomplete,
} from "@mui/material";
import { API_BASE_URL } from "../config";

/* ================= VALIDATION ================= */
const eightDigit = Yup.string()
  .matches(/^\d{8}$/, "Must be exactly 8 digits")
  .required("Required");

const validationSchema = Yup.object({
  customer_id: Yup.number().required("Customer is required"),
  name: Yup.string().required("Vehicle name required"),
  model: Yup.string().required("Model required"),
  year: Yup.number()
    .required("Year required")
    .min(1900)
    .max(new Date().getFullYear()),
  engine_no: eightDigit,
  price: Yup.number().required("Price required").min(0),
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

  const formik = useFormik({
    initialValues: {
      customer_id: "",
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
          ...values,
          year: Number(values.year),
          price: Number(values.price),
          customer_id: Number(values.customer_id),
        };

        console.log("Submitting vehicle:", payload);

        await axios.post(`${API_BASE_URL}/api/vehicles`, payload);

        setSuccess(true);
        resetForm();
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error || "Failed to submit vehicle"
        );
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Vehicle Information
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">Vehicle added successfully</Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>

              {/* CUSTOMER */}
              <Grid item xs={12}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(c) => `${c.name} - ${c.contact}`}
                  onChange={(_, value) =>
                    formik.setFieldValue(
                      "customer_id",
                      value ? value.id : ""
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Customer"
                      error={
                        formik.touched.customer_id &&
                        Boolean(formik.errors.customer_id)
                      }
                      helperText={
                        formik.touched.customer_id &&
                        formik.errors.customer_id
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Name"
                  {...formik.getFieldProps("name")}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  {...formik.getFieldProps("model")}
                  error={formik.touched.model && Boolean(formik.errors.model)}
                  helperText={formik.touched.model && formik.errors.model}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Manufacture Year"
                  {...formik.getFieldProps("year")}
                  error={formik.touched.year && Boolean(formik.errors.year)}
                  helperText={formik.touched.year && formik.errors.year}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Engine No"
                  inputProps={{ maxLength: 8 }}
                  {...formik.getFieldProps("engine_no")}
                  error={
                    formik.touched.engine_no &&
                    Boolean(formik.errors.engine_no)
                  }
                  helperText={
                    formik.touched.engine_no &&
                    formik.errors.engine_no
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  {...formik.getFieldProps("price")}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={formik.isSubmitting}
                >
                  Submit Vehicle
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
