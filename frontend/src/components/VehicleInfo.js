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
axios.get(`${API_BASE_URL}/api/health`);


/* ================= VALIDATION ================= */
const eightDigitField = Yup.string()
  .matches(/^\d{8}$/, "Must be exactly 8 digits")
  .required("Required");

const validationSchema = Yup.object({
  customer: Yup.object().required("Customer is required"),
  name: Yup.string().required("Vehicle name is required"),
  model: Yup.string().required("Model is required"),
  year: Yup.number()
    .required("Year is required")
    .min(1900, "Invalid year")
    .max(new Date().getFullYear(), "Future year not allowed"),

  engine_no: eightDigitField,
  chassis_no: eightDigitField,
  gearbox_no: eightDigitField,
  battery_no: eightDigitField,
  tire_front: eightDigitField,
  tire_rear_left: eightDigitField,
  tire_rear_right: eightDigitField,
  tire_stepney: eightDigitField,

  price: Yup.number().required("Price is required").min(0),
});

const VehicleInfo = () => {
  const [customers, setCustomers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH CUSTOMERS ================= */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/customers`)
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Failed to load customers"));
  }, []);

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
          customer_id: values.customer.id, // ✅ auto-mapped
        };

        await axios.post(`${API_BASE_URL}/api/vehicles`, payload);
        setSuccess(true);
        resetForm();
      } catch {
        setError("Failed to submit vehicle details");
      }
    },
  });

  /* ================= REUSABLE INPUT PROPS ================= */
  const eightDigitInputProps = {
    inputMode: "numeric",
    pattern: "[0-9]*",
    maxLength: 8,
    placeholder: "Enter 8-digit number",
  };

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

              {/* ================= CUSTOMER ================= */}
              <Grid item xs={12}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(o) =>
                    `${o.name} - ${o.email || "No Email"}`
                  }
                  value={formik.values.customer}
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
                        formik.touched.customer &&
                        formik.errors.customer
                      }
                    />
                  )}
                />
              </Grid>

              {/* ================= BASIC INFO ================= */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vehicle Name"
                  fullWidth
                  {...formik.getFieldProps("name")}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Model"
                  fullWidth
                  {...formik.getFieldProps("model")}
                  error={formik.touched.model && Boolean(formik.errors.model)}
                  helperText={formik.touched.model && formik.errors.model}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Manufacture Year"
                  type="number"
                  fullWidth
                  {...formik.getFieldProps("year")}
                  error={formik.touched.year && Boolean(formik.errors.year)}
                  helperText={formik.touched.year && formik.errors.year}
                />
              </Grid>

              {/* ================= 8-DIGIT FIELDS ================= */}
              {[
                { key: "engine_no", label: "Engine Number" },
                { key: "chassis_no", label: "Chassis Number" },
                { key: "gearbox_no", label: "Gearbox Number" },
                { key: "battery_no", label: "Battery Number" },
                { key: "tire_front", label: "Front Tire Number" },
                { key: "tire_rear_left", label: "Rear Left Tire Number" },
                { key: "tire_rear_right", label: "Rear Right Tire Number" },
                { key: "tire_stepney", label: "Stepney Tire Number" },
              ].map(({ key, label }) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    label={label}
                    fullWidth
                    {...eightDigitInputProps}
                    {...formik.getFieldProps(key)}
                    error={
                      formik.touched[key] &&
                      Boolean(formik.errors[key])
                    }
                    helperText={
                      formik.touched[key] && formik.errors[key]
                    }
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price"
                  type="number"
                  fullWidth
                  {...formik.getFieldProps("price")}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Button type="submit" variant="contained" fullWidth>
                Submit Vehicle
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default VehicleInfo;
