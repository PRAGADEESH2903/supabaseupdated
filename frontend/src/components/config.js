// src/config.js

// Central place for backend API URL
// Works for:
// - Local development
// - Vercel production deployment

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://supabaseupdated.onrender.com";
