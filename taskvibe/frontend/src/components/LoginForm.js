import React, { useState } from 'react';
import axios from '../axiosConfig';
import { Box, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

function LoginForm({ setIsAuthenticated }) {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/login/', loginData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('username', loginData.username);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      setIsAuthenticated(true);
      setLoginData({ username: '', password: '' });
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      setLoginData({ ...loginData, password: '' });
    }
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="نام کاربری"
        value={loginData.username}
        onChange={e => { setLoginData({ ...loginData, username: e.target.value }); setError(''); }}
        fullWidth
        variant="outlined"
        margin="dense"
      />
      <TextField
        label="رمز عبور"
        value={loginData.password}
        onChange={e => { setLoginData({ ...loginData, password: e.target.value }); setError(''); }}
        fullWidth
        variant="outlined"
        margin="dense"
        type="password"
      />
      <Button
        onClick={handleLogin}
        variant="contained"
        color="primary"
        size="large"
        startIcon={<LoginIcon />}
        fullWidth
      >
        ورود
      </Button>
    </Stack>
  );
}

export default LoginForm; 