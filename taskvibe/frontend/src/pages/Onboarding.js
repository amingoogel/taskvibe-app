import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChecklistIcon from '@mui/icons-material/Checklist';
import MoodIcon from '@mui/icons-material/Mood';
import GroupsIcon from '@mui/icons-material/Groups';

const highlights = [
  { icon: <ChecklistIcon color="primary" />, text: 'مدیریت تسک‌های روزانه با انرژی و اولویت' },
  { icon: <MoodIcon color="secondary" />, text: 'پیگیری مود و ثبت احساسات روزانه' },
  { icon: <GroupsIcon color="info" />, text: 'چالش‌های گروهی و همکاری با دوستان' },
  { icon: <EmojiEventsIcon color="warning" />, text: 'گزارش‌های هوشمند و پیشنهادهای شخصی‌سازی‌شده' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={6} sx={{ maxWidth: 420, width: '100%', p: 4, borderRadius: 5, textAlign: 'center', boxShadow: 8 }} className="dark:bg-zinc-800">
        <Typography variant="h4" fontWeight={800} gutterBottom>
          👋 خوش آمدید به TaskVibe!
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          یک تجربه مدرن برای مدیریت تسک، مود و چالش‌های گروهی
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {highlights.map((h, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1} justifyContent="center">
              {h.icon}
              <Typography>{h.text}</Typography>
            </Box>
          ))}
        </Stack>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ fontWeight: 700, fontSize: '1.1rem', py: 1.5, borderRadius: 3 }}
          onClick={() => {
            localStorage.setItem('onboarding_done', 'true');
            navigate('/dashboard');
          }}
        >
          شروع کنید 🚀
        </Button>
      </Paper>
    </Box>
  );
};

export default Onboarding; 