// Success.js
import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Purchase Completed
        </Typography>
        <Typography sx={{ mb: 2 }}>
          The purchase was created successfully.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/customers')}>
          Create Another Sale
        </Button>
      </Paper>
    </Box>
  );
};

export default Success;
