import React, { useEffect, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";

import { API_BASE_URL } from "../config";

/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  vehicle_id: Yup.number().required("Vehicle is required"),
  payment_method: Yup.string().required("Payment method required"),
  owner_name: Yup.string().required("Owner name required"),
  delivery_address: Yup.string().required("Delivery address required"),
  delivery_date: Yup.string().required("Delivery date required"),
  purchase_date: Yup.string().required("Purchase date required"),
  insurance_start: Yup.string().required("Insurance start required"),
  insurance_end: Yup.string().required("Insurance end required"),
});

/* ================= COMPONENT ================= */
export default function PurchaseOptions() {
  const [vehicles, setVehicles] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/vehicles`)
      .then(res => setVehicles(res.data))
      .catch(() => setError("Vehicle fetch failed"));

    axios.get(`${API_BASE_URL}/api/sub-dealers`)
      .then(res => setDealers(res.data))
      .catch(() => setDealers([]));
  }, []);

  const formik = useFormik({
    initialValues: {
      vehicle_id: "",
      dealer_id: "",
      payment_method: "cash",
      owner_name: "",
      delivery_address: "",
      delivery_date: "",
      purchase_date: "",
      insurance_start: "",
      insurance_end: "",
      bank_name: "",
      loan_amount: "",
      loan_tenure: "",
      interest_rate: "",
      emi_amount: "",
      down_payment: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError(null);
        setSuccess(false);

        const payload = {
          vehicle_id: parseInt(values.vehicle_id),
          payment_method: values.payment_method,
          owner_name: values.owner_name,
          delivery_address: values.delivery_address,
          delivery_date: values.delivery_date,
          purchase_date: values.purchase_date,
          insurance_start: values.insurance_start,
          insurance_end: values.insurance_end,
          dealer_id: values.dealer_id
            ? parseInt(values.dealer_id)
            : null,
        };

        if (values.payment_method === "loan") {
          payload.bank_name = values.bank_name || null;
          payload.loan_amount = values.loan_amount
            ? parseFloat(values.loan_amount)
            : null;
          payload.loan_tenure = values.loan_tenure
            ? parseInt(values.loan_tenure)
            : null;
          payload.interest_rate = values.interest_rate
            ? parseFloat(values.interest_rate)
            : null;
          payload.emi_amount = values.emi_amount
            ? parseFloat(values.emi_amount)
            : null;
          payload.down_payment = values.down_payment
            ? parseFloat(values.down_payment)
            : null;
        }

        await axios.post(`${API_BASE_URL}/api/purchases`, payload);

        setSuccess(true);
        resetForm();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to submit purchase");
      }
    },
  });

  /* ================= EMI CALCULATION ================= */
  useEffect(() => {
    if (
      formik.values.payment_method === "loan" &&
      formik.values.loan_amount &&
      formik.values.loan_tenure &&
      formik.values.interest_rate
    ) {
      const P = parseFloat(formik.values.loan_amount);
      const R = parseFloat(formik.values.interest_rate) / 100 / 12;
      const N = parseInt(formik.values.loan_tenure) * 12;

      if (R > 0) {
        const emi =
          (P * R * Math.pow(1 + R, N)) /
          (Math.pow(1 + R, N) - 1);

        if (formik.values.emi_amount !== emi.toFixed(2)) {
          formik.setFieldValue("emi_amount", emi.toFixed(2));
        }
      }
    }
  }, [
    formik.values.loan_amount,
    formik.values.loan_tenure,
    formik.values.interest_rate,
    formik.values.payment_method,
  ]);

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5">Purchase</Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Purchase Saved</Alert>}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            select
            fullWidth
            label="Vehicle"
            {...formik.getFieldProps("vehicle_id")}
            error={formik.touched.vehicle_id && Boolean(formik.errors.vehicle_id)}
            helperText={formik.touched.vehicle_id && formik.errors.vehicle_id}
            sx={{ mt: 2 }}
          >
            {vehicles.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name} - {v.model}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Dealer (Optional)"
            {...formik.getFieldProps("dealer_id")}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            {dealers.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Payment Method"
            {...formik.getFieldProps("payment_method")}
            sx={{ mt: 2 }}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="loan">Loan</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Owner Name"
            {...formik.getFieldProps("owner_name")}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Delivery Address"
            {...formik.getFieldProps("delivery_address")}
            sx={{ mt: 2 }}
          />

          <TextField
            type="date"
            fullWidth
            label="Delivery Date"
            InputLabelProps={{ shrink: true }}
            {...formik.getFieldProps("delivery_date")}
            sx={{ mt: 2 }}
          />

          <TextField
            type="date"
            fullWidth
            label="Purchase Date"
            InputLabelProps={{ shrink: true }}
            {...formik.getFieldProps("purchase_date")}
            sx={{ mt: 2 }}
          />

          <TextField
            type="date"
            fullWidth
            label="Insurance Start"
            InputLabelProps={{ shrink: true }}
            {...formik.getFieldProps("insurance_start")}
            sx={{ mt: 2 }}
          />

          <TextField
            type="date"
            fullWidth
            label="Insurance End"
            InputLabelProps={{ shrink: true }}
            {...formik.getFieldProps("insurance_end")}
            sx={{ mt: 2 }}
          />

          {formik.values.payment_method === "loan" && (
            <>
              <TextField fullWidth label="Bank Name" {...formik.getFieldProps("bank_name")} sx={{ mt: 2 }} />
              <TextField fullWidth label="Loan Amount" type="number" {...formik.getFieldProps("loan_amount")} sx={{ mt: 2 }} />
              <TextField fullWidth label="Loan Tenure (Years)" type="number" {...formik.getFieldProps("loan_tenure")} sx={{ mt: 2 }} />
              <TextField fullWidth label="Interest Rate (%)" type="number" {...formik.getFieldProps("interest_rate")} sx={{ mt: 2 }} />
              <TextField fullWidth label="EMI Amount" disabled {...formik.getFieldProps("emi_amount")} sx={{ mt: 2 }} />
              <TextField fullWidth label="Down Payment" type="number" {...formik.getFieldProps("down_payment")} sx={{ mt: 2 }} />
            </>
          )}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            Submit
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
