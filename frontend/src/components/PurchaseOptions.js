import React, { useState, useEffect } from "react";
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
  Divider,
  Alert,
} from "@mui/material";
import { API_BASE_URL } from "../config";
axios.get(`${API_BASE_URL}/api/health`);



/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  vehicle_id: Yup.number().required("Vehicle is required"),
  payment_method: Yup.string().required("Payment method is required"),

  bank_name: Yup.string().when("payment_method", {
    is: "loan",
    then: (s) => s.required("Bank name is required"),
    otherwise: (s) => s.nullable(),
  }),

  loan_amount: Yup.number().when("payment_method", {
    is: "loan",
    then: (s) => s.required("Loan amount is required"),
    otherwise: (s) => s.nullable(),
  }),

  loan_tenure: Yup.number().when("payment_method", {
    is: "loan",
    then: (s) => s.required("Loan tenure is required"),
    otherwise: (s) => s.nullable(),
  }),

  interest_rate: Yup.number().when("payment_method", {
    is: "loan",
    then: (s) => s.required("Interest rate is required"),
    otherwise: (s) => s.nullable(),
  }),

  emi_amount: Yup.number().when("payment_method", {
    is: "loan",
    then: (s) => s.required("EMI amount is required"),
    otherwise: (s) => s.nullable(),
  }),

  down_payment: Yup.number().when("payment_method", {
    is: "loan",
    then: (s) => s.required("Down payment is required"),
    otherwise: (s) => s.nullable(),
  }),

  insurance_start: Yup.date().when("payment_method", {
    is: "loan",
    then: (s) => s.required("Insurance start date is required"),
    otherwise: (s) => s.nullable(),
  }),

  insurance_end: Yup.date().when("payment_method", {
    is: "loan",
    then: (s) => s.required("Insurance end date is required"),
    otherwise: (s) => s.nullable(),
  }),

  delivery_address: Yup.string().required("Delivery address is required"),
  delivery_date: Yup.date().required("Delivery date is required"),
  purchase_date: Yup.date().required("Purchase date is required"),
  owner_name: Yup.string().required("Owner name is required"),
});

const PurchaseOptions = () => {
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDealers, setAvailableDealers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH VEHICLES ================= */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/vehicles`)
      .then((res) =>
        setAvailableVehicles(
          res.data.filter(
            (v) => !v.purchases || v.purchases.length === 0
          )
        )
      )
      .catch(() => setError("Failed to fetch vehicles"));
  }, []);

  /* ================= FETCH DEALERS ================= */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/sub-dealers`)
      .then((res) => setAvailableDealers(res.data || []))
      .catch(() => setAvailableDealers([]));
  }, []);

  const formik = useFormik({
    initialValues: {
      vehicle_id: "",
      dealer_id: "",
      payment_method: "",
      bank_name: "",
      loan_amount: "",
      loan_tenure: "",
      interest_rate: "",
      emi_amount: "",
      down_payment: "",
      insurance_start: "",
      insurance_end: "",
      delivery_address: "",
      delivery_date: "",
      purchase_date: "",
      owner_name: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError(null);

        const payload = {
          vehicle_id: Number(values.vehicle_id),
          payment_method: values.payment_method,
          delivery_address: values.delivery_address,
          delivery_date: values.delivery_date,
          purchase_date: values.purchase_date,
          owner_name: values.owner_name,
        };

        if (values.dealer_id) {
          payload.dealer_id = Number(values.dealer_id);
        }

        if (values.payment_method === "loan") {
          payload.bank_name = values.bank_name;
          payload.loan_amount = Number(values.loan_amount);
          payload.loan_tenure = Number(values.loan_tenure);
          payload.interest_rate = Number(values.interest_rate);
          payload.emi_amount = Number(values.emi_amount);
          payload.down_payment = Number(values.down_payment);
          payload.insurance_start = values.insurance_start;
          payload.insurance_end = values.insurance_end;
        }

        await axios.post(`${API_BASE_URL}/api/purchases`, payload);

        setSuccess(true);
        resetForm();
      } catch (err) {
        setError("Failed to submit purchase details");
      }
    },
  });

  /* ================= EMI AUTO CALC (FIXED) ================= */
  useEffect(() => {
    if (
      formik.values.payment_method === "loan" &&
      formik.values.loan_amount &&
      formik.values.loan_tenure &&
      formik.values.interest_rate
    ) {
      const P = Number(formik.values.loan_amount);
      const R = Number(formik.values.interest_rate) / 100 / 12;
      const N = Number(formik.values.loan_tenure) * 12;

      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      formik.setFieldValue("emi_amount", emi.toFixed(2));
    }
  }, [
    formik, // ✅ REQUIRED dependency (fixes ESLint warning)
    formik.values.loan_amount,
    formik.values.loan_tenure,
    formik.values.interest_rate,
    formik.values.payment_method,
  ]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Purchase Details
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Purchase completed successfully
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* VEHICLE */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Select Vehicle"
                  {...formik.getFieldProps("vehicle_id")}
                >
                  {availableVehicles.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name} - {v.model}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* DEALER */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Select Dealer (Optional)"
                  {...formik.getFieldProps("dealer_id")}
                >
                  <MenuItem value="">None</MenuItem>
                  {availableDealers.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* PAYMENT */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Payment Method"
                  {...formik.getFieldProps("payment_method")}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="loan">Loan</MenuItem>
                </TextField>
              </Grid>

              {/* LOAN DETAILS */}
              {formik.values.payment_method === "loan" && (
                <>
                  <Grid item xs={12}>
                    <Divider>Loan Details</Divider>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Bank Name"
                      fullWidth
                      {...formik.getFieldProps("bank_name")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Loan Amount"
                      type="number"
                      fullWidth
                      {...formik.getFieldProps("loan_amount")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Loan Tenure (Years)"
                      type="number"
                      fullWidth
                      {...formik.getFieldProps("loan_tenure")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Interest Rate (%)"
                      type="number"
                      fullWidth
                      {...formik.getFieldProps("interest_rate")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="EMI Amount"
                      fullWidth
                      disabled
                      {...formik.getFieldProps("emi_amount")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Down Payment"
                      type="number"
                      fullWidth
                      {...formik.getFieldProps("down_payment")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="date"
                      label="Insurance Start Date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      {...formik.getFieldProps("insurance_start")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="date"
                      label="Insurance End Date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      {...formik.getFieldProps("insurance_end")}
                    />
                  </Grid>
                </>
              )}

              {/* DELIVERY */}
              <Grid item xs={12}>
                <Divider>Delivery Details</Divider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Delivery Address"
                  fullWidth
                  multiline
                  rows={2}
                  {...formik.getFieldProps("delivery_address")}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Delivery Date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  {...formik.getFieldProps("delivery_date")}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Purchase Date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  {...formik.getFieldProps("purchase_date")}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Owner Name"
                  fullWidth
                  {...formik.getFieldProps("owner_name")}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Button type="submit" variant="contained" fullWidth>
                Submit Purchase
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default PurchaseOptions;
