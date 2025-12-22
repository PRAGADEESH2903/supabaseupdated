import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  contact: Yup.string()
    .matches(/^[0-9]{10}$/, "Contact must be exactly 10 digits")
    .required("Contact is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
});

/* ================= COMPONENT ================= */
const CustomerInfo = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      contact: "",      // ✅ MUST MATCH DATABASE
      email: "",
      address: "",
      city: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError(null);
        setSuccess(false);

        console.log("Submitting customer:", values);

        const res = await axios.post(
          `${API_BASE_URL}/api/customers`,
          values
        );

        if (res.status === 201 || res.status === 200) {
          setSuccess(true);
          resetForm();

          // 👉 auto move to vehicle page
          setTimeout(() => navigate("/vehicles"), 800);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error || "Failed to submit customer"
        );
      }
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Customer Information
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && (
          <Alert severity="success">
            Customer added successfully!
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact"
                name="contact"
                value={formik.values.contact}
                onChange={formik.handleChange}
                error={formik.touched.contact && Boolean(formik.errors.contact)}
                helperText={formik.touched.contact && formik.errors.contact}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={formik.isSubmitting}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CustomerInfo;
