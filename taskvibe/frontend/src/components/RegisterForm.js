import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { Box, TextField, Button, Typography, Alert, Stack, Stepper, Step, StepLabel, CircularProgress, LinearProgress } from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function RegisterForm({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    password2: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const steps = ['اطلاعات کاربری', 'تایید ایمیل', 'ورود به سیستم'];

  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 1;
    else feedback.push('حداقل ۸ کاراکتر');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('حرف بزرگ');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('حرف کوچک');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('عدد');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('کاراکتر خاص');
    
    return { score, feedback, percentage: (score / 5) * 100 };
  };

  const handleValidateAndSendVerification = async () => {
    if (!registerData.username || !registerData.email || !registerData.password) {
      setError('لطفاً تمام فیلدها را پر کنید');
      return;
    }
    
    if (registerData.password !== registerData.password2) {
      setError('رمز عبور و تکرار آن یکسان نیست');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/api/validate-registration/', {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });
      setEmailSent(true);
      setSuccess('لینک تایید به ایمیل شما ارسال شد');
      setStep(1);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.error || 'خطا در ارسال لینک تایید');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmailVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if email is verified by trying to register
      await axios.post('http://localhost:8000/api/register/', {
        username: registerData.username,
        email: registerData.email,
        password: 'temp_password_for_check'
      });
      setSuccess('ایمیل تایید شده است');
      setStep(2);
    } catch (error) {
      if (error.response?.data?.error === 'لطفاً ابتدا ایمیل خود را تایید کنید') {
        setError('لطفاً ابتدا ایمیل خود را تایید کنید');
      } else {
        setSuccess('ایمیل تایید شده است');
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };



  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <TextField
              label="نام کاربری"
              value={registerData.username}
              onChange={e => { setRegisterData({ ...registerData, username: e.target.value }); setError(''); }}
              fullWidth
              variant="outlined"
              margin="dense"
            />
            <TextField
              label="ایمیل"
              value={registerData.email}
              onChange={e => { setRegisterData({ ...registerData, email: e.target.value }); setError(''); }}
              fullWidth
              variant="outlined"
              margin="dense"
              type="email"
            />
            <Box>
              <TextField
                label="رمز عبور"
                value={registerData.password}
                onChange={e => { setRegisterData({ ...registerData, password: e.target.value }); setError(''); }}
                fullWidth
                variant="outlined"
                margin="dense"
                type="password"
              />
              {registerData.password && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={checkPasswordStrength(registerData.password).percentage}
                    sx={{ 
                      height: 4, 
                      borderRadius: 2,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: checkPasswordStrength(registerData.password).percentage < 40 ? '#f44336' :
                                       checkPasswordStrength(registerData.password).percentage < 80 ? '#ff9800' : '#4caf50'
                      }
                    }} 
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    قدرت رمز عبور: {checkPasswordStrength(registerData.password).score}/5
                  </Typography>
                  {checkPasswordStrength(registerData.password).feedback.length > 0 && (
                    <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                      نیاز به: {checkPasswordStrength(registerData.password).feedback.join('، ')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            <TextField
              label="تکرار رمز عبور"
              value={registerData.password2}
              onChange={e => { setRegisterData({ ...registerData, password2: e.target.value }); setError(''); }}
              fullWidth
              variant="outlined"
              margin="dense"
              type="password"
            />
            <Button
              onClick={handleValidateAndSendVerification}
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
              fullWidth
              disabled={
                loading || 
                !registerData.username || 
                !registerData.email || 
                !registerData.password || 
                !registerData.password2 ||
                checkPasswordStrength(registerData.password).score < 5
              }
            >
              ارسال لینک تایید
            </Button>
            {registerData.password && checkPasswordStrength(registerData.password).score < 5 && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                لطفاً رمز عبور قوی‌تری انتخاب کنید
              </Typography>
            )}
          </Stack>
        );
      
      case 1:
        return (
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary" align="center">
              لینک تایید به ایمیل {registerData.email} ارسال شد
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              لطفاً ایمیل خود را بررسی کرده و روی لینک تایید کلیک کنید
            </Typography>
            <Button
              onClick={handleCheckEmailVerification}
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              fullWidth
              disabled={loading}
            >
              بررسی تایید ایمیل
            </Button>
            <Button
              onClick={() => setStep(0)}
              variant="outlined"
              size="small"
              fullWidth
            >
              بازگشت
            </Button>
          </Stack>
        );
      
      case 2:
        return (
          <Stack spacing={2}>
            <Typography variant="h6" align="center" gutterBottom>
              ثبت نام با موفقیت انجام شد!
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
              حالا می‌توانید وارد سیستم شوید
            </Typography>
            <Button
              onClick={() => {
                setIsAuthenticated(true);
                navigate('/dashboard');
              }}
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PersonAddAlt1Icon />}
              fullWidth
            >
              ورود به سیستم
            </Button>
            <Button
              onClick={() => setStep(1)}
              variant="outlined"
              size="small"
              fullWidth
            >
              بازگشت
            </Button>
          </Stack>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {renderStepContent()}
    </Box>
  );
}

export default RegisterForm; 