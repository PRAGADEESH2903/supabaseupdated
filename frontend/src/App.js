// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "./theme";

/* ---------------- COMPONENT IMPORTS ---------------- */
import VehicleDashboard from "./components/VehicleDashboard";
import CustomerInfo from "./components/CustomerInfo";
import VehicleInfo from "./components/VehicleInfo";
import SubDealerInfo from "./components/SubDealerInfo";
import ServiceDetails from "./components/ServiceDetails";
import PurchaseOptions from "./components/PurchaseOptions";
import SearchResults from "./components/SearchResults";
import TopSearchBar from "./components/TopSearchBar";
import Success from "./components/Success";

/* ---------------- APP ---------------- */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Top navigation always visible */}
        <TopSearchBar />

        <Box sx={{ pt: 10, px: 2, pb: 6 }}>
          <Routes>
            {/* Default → Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* MAIN DASHBOARD */}
            <Route path="/dashboard" element={<VehicleDashboard />} />

            {/* WORKFLOW PAGES */}
            <Route path="/customers" element={<CustomerInfo />} />
            <Route path="/vehicles" element={<VehicleInfo />} />
            <Route path="/dealers" element={<SubDealerInfo />} />
            <Route path="/services" element={<ServiceDetails />} />
            <Route path="/purchases" element={<PurchaseOptions />} />
            <Route path="/success" element={<Success />} />

            {/* SEARCH */}
            <Route path="/search" element={<SearchResults />} />

            {/* FALLBACK → Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
