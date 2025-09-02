import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Box textAlign="center" mt={10}>
      <Typography variant="h3" gutterBottom>صفحه پیدا نشد! 😢</Typography>
      <Typography variant="h6" gutterBottom>آدرس وارد شده وجود ندارد.</Typography>
      <Button variant="contained" color="primary" onClick={()=>navigate('/')}>بازگشت به خانه</Button>
    </Box>
  );
};

export default NotFound; 