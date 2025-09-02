import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Button, TextField, Stack, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../axiosConfig';
import { setProfile } from '../store/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.user.profile);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/profile/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(res => {
        dispatch(setProfile(res.data));
        setForm(res.data);
      })
      .catch(() => setSnackbar({ open: true, message: 'خطا در دریافت اطلاعات کاربر', severity: 'error' }))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm(profile);
  };
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    setLoading(true);
    axios.put('http://localhost:8000/api/profile/', form, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(res => {
        dispatch(setProfile(res.data));
        setEditMode(false);
        setSnackbar({ open: true, message: 'اطلاعات با موفقیت ذخیره شد', severity: 'success' });
      })
      .catch(() => setSnackbar({ open: true, message: 'خطا در ذخیره اطلاعات', severity: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      handleAvatarUpload(e.target.files[0]);
    }
  };
  const handleAvatarUpload = (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    axios.put('http://localhost:8000/api/profile/', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(res => {
        dispatch(setProfile(res.data));
        setSnackbar({ open: true, message: 'آواتار با موفقیت آپلود شد', severity: 'success' });
      })
      .catch(() => setSnackbar({ open: true, message: 'خطا در آپلود آواتار', severity: 'error' }))
      .finally(() => setLoading(false));
  };

  if (loading && !profile) return <Box textAlign="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Paper elevation={3} sx={{p:4, borderRadius:4}}>
        <Stack spacing={3} alignItems="center">
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }} src={profile?.avatar || undefined}>
            {!profile?.avatar && <AccountCircleIcon sx={{ fontSize: 60 }} />}
          </Avatar>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            sx={{ mt: 1, mb: 2 }}
          >
            آپلود آواتار
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </Button>
          <Typography variant="h5" fontWeight={700}>پروفایل کاربر 👤</Typography>
          <TextField label="نام کاربری" name="username" value={form.username} fullWidth disabled />
          <TextField label="ایمیل" name="email" value={form.email} onChange={handleChange} fullWidth disabled={!editMode} />
          <TextField label="نام" name="first_name" value={form.first_name} onChange={handleChange} fullWidth disabled={!editMode} />
          <TextField label="نام خانوادگی" name="last_name" value={form.last_name} onChange={handleChange} fullWidth disabled={!editMode} />
          {editMode ? (
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="success" onClick={handleSave} disabled={loading}>ذخیره</Button>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>انصراف</Button>
            </Stack>
          ) : (
            <Button variant="contained" color="primary" onClick={handleEdit}>ویرایش اطلاعات</Button>
          )}
        </Stack>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={()=>setSnackbar({...snackbar, open:false})}>
        <Alert severity={snackbar.severity} onClose={()=>setSnackbar({...snackbar, open:false})}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 