import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";

import { API_BASE_URL } from "../config";
axios.get(`${API_BASE_URL}/api/health`);



const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchType = searchParams.get("type") || "customer";
  const query = searchParams.get("q") || "";

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Search to get customer ID
        const searchRes = await axios.get(
          `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`
        );

        const customers = searchRes.data.customers || [];
        if (!customers.length) {
          setData(null);
          return;
        }

        // 2️⃣ Fetch full details for first matched customer
        const customerId = customers[0].id;

        const detailsRes = await axios.get(
          `${API_BASE_URL}/api/customers/${customerId}/full-details`
        );

        setData(detailsRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    };

    if (searchType === "customer" && query.length >= 2) {
      fetchCustomerDetails();
    }
  }, [searchType, query]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!data) {
    return <Typography>No results found for "{query}"</Typography>;
  }

  const { customer, vehicles } = data;

  return (
    <Box sx={{ mt: 2 }}>
      {/* ================= CUSTOMER ================= */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">👤 {customer.name}</Typography>
        <Typography>ID: {customer.id}</Typography>
        <Typography>Phone: {customer.phone}</Typography>
        <Typography>Email: {customer.email}</Typography>
      </Paper>

      {/* ================= VEHICLES ================= */}
      {vehicles.map((v) => (
        <Paper key={v.id} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6">
            🚗 {v.name} - {v.model}
          </Typography>
          <Typography>Engine No: {v.engine_no}</Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1">Service History</Typography>

          {v.services.length === 0 && (
            <Typography>No services found</Typography>
          )}

          {v.services.map((s) => (
            <Box key={s.id} sx={{ mb: 1 }}>
              <Typography>
                Service #{s.service_count} —{" "}
                <Chip
                  label={s.status}
                  color={s.status === "Completed" ? "success" : "warning"}
                  size="small"
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(s.date).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </Paper>
      ))}
    </Box>
  );
};

export default SearchResults;
