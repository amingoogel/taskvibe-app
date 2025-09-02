import React from 'react';
import TaskManager from '../components/TaskManager';
import DailyPhoto from '../components/DailyPhoto';
import MoodTracker from '../components/MoodTracker';
import Analytics from '../components/Analytics';
import { Grid, Paper, Typography, Box } from '@mui/material';

const Dashboard = () => (
  <Box>
    <Typography variant="h4" align="center" fontWeight={700} gutterBottom sx={{mb:4}}>
      داشبورد <span role="img" aria-label="dashboard">📊</span>
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{p:2, mb:2}}>
          <TaskManager showOnlyToday={true} showAddTaskForm={false} />
        </Paper>
        <Paper elevation={3} sx={{p:2, mb:2}}>
          <MoodTracker />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{p:2, mb:2}}>
          <Analytics />
        </Paper>
        <Paper elevation={3} sx={{p:2, mb:2}}>
          <DailyPhoto />
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

export default Dashboard; 