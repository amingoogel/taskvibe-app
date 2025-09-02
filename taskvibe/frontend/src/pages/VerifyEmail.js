import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress, 
  Button, 
  Container,
  Paper 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('لینک تایید نامعتبر است');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/verify-email/?token=${token}&email=${email}`);
        setStatus('success');
        setMessage('ایمیل شما با موفقیت تایید شد!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'خطا در تایید ایمیل');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center'
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            در حال تایید ایمیل...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            width: '100%',
            maxWidth: 400
          }}
        >
          {status === 'success' ? (
            <>
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 80, 
                  color: 'success.main',
                  mb: 2 
                }} 
              />
              <Typography variant="h5" gutterBottom>
                تایید موفق!
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleGoToLogin}
                fullWidth
                sx={{ mb: 2 }}
              >
                ورود به سیستم
              </Button>
            </>
          ) : (
            <>
              <ErrorIcon 
                sx={{ 
                  fontSize: 80, 
                  color: 'error.main',
                  mb: 2 
                }} 
              />
              <Typography variant="h5" gutterBottom>
                خطا در تایید
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
            </>
          )}
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            fullWidth
          >
            بازگشت به صفحه اصلی
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default VerifyEmail; 