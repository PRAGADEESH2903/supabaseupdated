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
axios.get(`${API_BASE_URL}/api/health`);


/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  contact_no: Yup.string()
    .matches(/^[0-9]{10}$/, "Contact number must be exactly 10 digits")
    .required("Contact number is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
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
      contact_no: "",   // 🔥 FIXED (was `contact`)
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

        if (res.status === 201) {
          setSuccess(true);
          resetForm();

          // ✅ AUTO NAVIGATE TO VEHICLE PAGE
          setTimeout(() => {
            navigate("/vehicles");
          }, 800);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error ||
            "Failed to submit customer details"
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Customer information submitted successfully!
            Redirecting to Vehicle page…
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* NAME */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            {/* CONTACT NUMBER */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="contact_no"   // 🔥 FIXED
                label="Contact Number"
                placeholder="Enter 10-digit number"
                value={formik.values.contact_no}
                onChange={formik.handleChange}
                error={
                  formik.touched.contact_no &&
                  Boolean(formik.errors.contact_no)
                }
                helperText={
                  formik.touched.contact_no &&
                  formik.errors.contact_no
                }
                inputProps={{
                  maxLength: 10,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
              />
            </Grid>

            {/* EMAIL */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            {/* CITY */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>

            {/* ADDRESS */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                multiline
                rows={3}
                value={formik.values.address}
                onChange={formik.handleChange}
                error={
                  formik.touched.address &&
                  Boolean(formik.errors.address)
                }
                helperText={
                  formik.touched.address &&
                  formik.errors.address
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
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
