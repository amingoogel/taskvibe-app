import React, { useState, useContext } from 'react';
import { Box, Typography, Paper, Stack, TextField, Button, Divider, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useTheme } from '@mui/material/styles';
import axios from '../axiosConfig';
import { ColorModeContext } from '../index';


const Settings = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setSnackbar({ open: true, message: 'همه فیلدها را پر کنید.', severity: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'رمز جدید و تکرار آن یکسان نیست.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/password_change/', {
        old_password: oldPassword,
        new_password: newPassword,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setSnackbar({ open: true, message: 'رمز عبور با موفقیت تغییر کرد.', severity: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setSnackbar({ open: true, message: 'خطا در تغییر رمز عبور.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Paper elevation={3} sx={{p:4, borderRadius:4}}>
        <Typography variant="h5" fontWeight={700} gutterBottom>تنظیمات <span role="img" aria-label="settings">⚙️</span></Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom><LockIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> تغییر رمز عبور</Typography>
            <Stack spacing={2}>
              <TextField label="رمز عبور فعلی" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} fullWidth />
              <TextField label="رمز عبور جدید" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} fullWidth />
              <TextField label="تکرار رمز جدید" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} fullWidth />
              <Button variant="contained" color="primary" onClick={handlePasswordChange} disabled={loading} fullWidth>تغییر رمز عبور</Button>
            </Stack>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom><NotificationsActiveIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> اعلان‌ها</Typography>
            <FormControlLabel
              control={<Switch checked={notifEnabled} onChange={e => setNotifEnabled(e.target.checked)} />}
              label="دریافت اعلان‌های ایمیلی (غیرفعال/آزمایشی)"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom><Brightness4Icon sx={{ verticalAlign: 'middle', mr: 1 }} /> تم برنامه</Typography>
            <FormControlLabel
              control={<Switch checked={theme.palette.mode === 'dark'} onChange={colorMode.toggleColorMode} />}
              label={theme.palette.mode === 'dark' ? 'تم تاریک' : 'تم روشن'}
            />
          </Box>
        </Stack>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 