import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Box, Typography, TextField, Button, Input } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

function DailyPhoto({ date }) {
  const [photo, setPhoto] = useState(null);
  const [mood, setMood] = useState('');
  const [dailyPhoto, setDailyPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const effectiveDate = date || new Date();
  const dateString = effectiveDate.toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/photos/by-date/', { params: { date: dateString } })
      .then(response => {
        setDailyPhoto(response.data);
        setMood(response.data.mood || '');
      })
      .catch(() => setDailyPhoto(null))
      .finally(() => setLoading(false));
  }, [date]);

  const handleUploadPhoto = async () => {
    if (!photo) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('mood', mood);
    formData.append('date', dateString);
    try {
      const response = await axios.post('http://localhost:8000/api/photos/by-date/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDailyPhoto(response.data);
      setPhoto(null);
      setMood(response.data.mood || '');
    } catch (error) {
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        عکس روز {effectiveDate.toLocaleDateString('fa-IR')}
      </Typography>
      <Tooltip title="آپلود عکس روزانه" arrow>
        <Input
          type="file"
          onChange={e => setPhoto(e.target.files[0])}
          sx={{ mb: 2 }}
          fullWidth
        />
      </Tooltip>
      <TextField
        type="text"
        value={mood}
        onChange={e => setMood(e.target.value)}
        placeholder="حس و حال شما"
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button 
        onClick={handleUploadPhoto} 
        variant="contained" 
        color="primary" 
        fullWidth 
        disabled={uploading || !photo}
      >
        {uploading ? 'در حال آپلود...' : 'آپلود عکس'}
      </Button>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ my: 2 }}>
          <CircularProgress />
        </Box>
      ) : !dailyPhoto ? (
        <Typography color="text.secondary" align="center" sx={{ my: 2 }}>
          عکسی برای این روز ثبت نشده است.
        </Typography>
      ) : (
        <Fade in timeout={500}>
          <Box sx={{ mt: 2 }}>
            <Tooltip title="عکس روزانه شما" arrow>
              <img 
                src={dailyPhoto.photo} 
                alt="Daily Photo" 
                style={{ maxWidth: '300px', borderRadius: '8px' }} 
              />
            </Tooltip>
            <Typography sx={{ mt: 2 }}>
              حس و حال: {dailyPhoto.mood}
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
}

export default DailyPhoto;