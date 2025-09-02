import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);
// اضافه کردن ایمپورت‌های MUI و آیکون‌ها
import { Box, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Chip, Stack } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import MoodIcon from '@mui/icons-material/Mood';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/analytics/')
      .then(response => setAnalytics(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>;
  if (!analytics) return null;

  const chartData = {
    labels: ['انجام شده', 'باقی‌مانده'],
    datasets: [{
      label: 'تسک‌ها',
      data: [
        analytics.daily_report.completed_tasks,
        analytics.daily_report.total_tasks - analytics.daily_report.completed_tasks
      ],
      backgroundColor: ['#8B5CF6', '#EF4444']
    }]
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        <InsightsIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
        گزارش روزانه <span role="img" aria-label="chart">📊</span>
      </Typography>
      <Bar data={chartData} options={{ scales: { y: { beginAtZero: true } } }} />
      <Typography sx={{ mt: 2 }}>
        نرخ تکمیل: <Chip label={analytics.daily_report.completion_rate.toFixed(2) + '%'} color="success" />
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        <EmojiObjectsIcon color="warning" sx={{ verticalAlign: 'middle', mr: 1 }} />
        پیشنهادهای هوشمند <span role="img" aria-label="bulb">💡</span>
      </Typography>
      <List>
        {analytics.suggestions.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ my: 2 }}>پیشنهادی وجود ندارد.</Typography>
        ) : analytics.suggestions.map((suggestion, index) => (
          <Fade in timeout={400 + index * 50} key={index}>
            <ListItem sx={{ 
              bgcolor: 'background.default', 
              borderRadius: 2, 
              mb: 1,
              border: 1,
              borderColor: 'divider'
            }}>
              <ListItemIcon>
                <Tooltip title="پیشنهاد هوشمند" arrow>
                  <EmojiObjectsIcon color="warning" />
                </Tooltip>
              </ListItemIcon>
              <ListItemText
                primary={suggestion.title}
                secondary={<>
                  سطح انرژی: <Chip label={suggestion.energy_level} size="small" />
                </>}
              />
            </ListItem>
          </Fade>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        <MoodIcon color="secondary" sx={{ verticalAlign: 'middle', mr: 1 }} />
        تحلیل مود <span role="img" aria-label="mood">😊</span>
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {analytics.mood_analysis.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ my: 2 }}>تحلیلی وجود ندارد.</Typography>
        ) : analytics.mood_analysis.map((mood, index) => (
          <Fade in timeout={400 + index * 50} key={index}>
            <Tooltip title={mood.mood} arrow>
              <Chip
                icon={<MoodIcon />}
                label={`${mood.mood} : ${mood.count} بار`}
                color="info"
                sx={{ mb: 1 }}
              />
            </Tooltip>
          </Fade>
        ))}
      </Stack>
    </Box>
  );
}

export default Analytics;