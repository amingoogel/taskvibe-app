import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../store/userSlice';

const Register = () => {
  const dispatch = useDispatch();
  return (
    <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#f3f4f6'}}>
      <Paper elevation={4} sx={{minWidth:350,p:4,borderRadius:4}}>
        <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
          ثبت‌نام در TaskVibe ✨
        </Typography>
        <Typography align="center" sx={{mb:2}}>
          برای ساخت حساب جدید فرم زیر را پر کنید
        </Typography>
        <RegisterForm setIsAuthenticated={() => dispatch(setAuthenticated(true))} />
        <Button component={Link} to="/login" fullWidth sx={{mt:2}}>
          قبلاً ثبت‌نام کرده‌اید؟ وارد شوید
        </Button>
      </Paper>
    </Box>
  );
};

export default Register; 