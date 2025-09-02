import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
// اضافه کردن ایمپورت‌های MUI و آیکون‌ها
import { Box, Typography, Button, MenuItem, TextField, List, ListItem, ListItemIcon, ListItemText, Chip, Divider } from '@mui/material';
import MoodIcon from '@mui/icons-material/Mood';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

function MoodTracker() {
  const [mood, setMood] = useState('');
  const [moods, setMoods] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/moods/')
      .then(response => setMoods(response.data))
      .finally(() => setLoading(false));
  }, []);

  const handleAddMood = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/moods/', { mood });
      setMoods([...moods, response.data]);
      setMood('');
      setError('');
    } catch (error) {
      setError('ثبت مود ناموفق بود!');
    }
  };

  const moodOptions = [
    { value: 'HAPPY', label: 'شاد', icon: <SentimentVerySatisfiedIcon color="success" />, emoji: '😃' },
    { value: 'TIRED', label: 'خسته', icon: <SentimentDissatisfiedIcon color="warning" />, emoji: '😩' },
    { value: 'ANXIOUS', label: 'نگران', icon: <SentimentVeryDissatisfiedIcon color="error" />, emoji: '😰' },
    { value: 'EXCITED', label: 'هیجان‌زده', icon: <EmojiEmotionsIcon color="info" />, emoji: '🤩' },
  ];
  const getMoodOption = (val) => moodOptions.find(opt => opt.value === val);

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        <MoodIcon color="secondary" sx={{ verticalAlign: 'middle', mr: 1 }} />
        ثبت مود روزانه <span role="img" aria-label="mood">🧠</span>
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        select
        label="مود خود را انتخاب کنید"
        value={mood}
        onChange={e => setMood(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">انتخاب مود</MenuItem>
        {moodOptions.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.icon} {opt.label} {opt.emoji}
          </MenuItem>
        ))}
      </TextField>
      <Button
        onClick={handleAddMood}
        variant="contained"
        color="secondary"
        size="large"
        startIcon={<MoodIcon />}
        fullWidth
        sx={{ mb: 2 }}
        disabled={!mood}
      >
        ثبت مود
      </Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        مودهای اخیر <span role="img" aria-label="recent">🕒</span>
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
          <CircularProgress />
        </Box>
      ) : moods.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 2 }}>مودی ثبت نشده است.</Typography>
      ) : (
        <List>
          {moods.map((moodObj, i) => {
            const opt = getMoodOption(moodObj.mood);
            return (
              <Fade in timeout={400 + i * 50} key={moodObj.id}>
                <ListItem sx={{ 
                  bgcolor: 'background.default', 
                  borderRadius: 2, 
                  mb: 1,
                  border: 1,
                  borderColor: 'divider'
                }}>
                  <ListItemIcon>
                    <Tooltip title={opt?.label || moodObj.mood} arrow>
                      {opt?.icon || <MoodIcon />}
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText
                    primary={<>{opt?.label || moodObj.mood} {opt?.emoji}</>}
                    secondary={new Date(moodObj.recorded_at).toLocaleString('fa-IR')}
                  />
                </ListItem>
              </Fade>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export default MoodTracker;