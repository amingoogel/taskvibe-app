import React from 'react';
import LoginForm from '../components/LoginForm';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthenticated } from '../store/userSlice';

const Login = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  return (
    <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#f3f4f6'}}>
      <Paper elevation={4} sx={{minWidth:350,p:4,borderRadius:4}}>
        <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
          خوش آمدید به TaskVibe 🚀
        </Typography>
        <Typography align="center" sx={{mb:2}}>
          لطفاً وارد حساب کاربری خود شوید
        </Typography>
        <LoginForm setIsAuthenticated={() => dispatch(setAuthenticated(true))} />
        <Button component={Link} to="/register" fullWidth sx={{mt:2}}>
          حساب کاربری ندارید؟ ثبت‌نام کنید
        </Button>
      </Paper>
    </Box>
  );
};

export default Login; 