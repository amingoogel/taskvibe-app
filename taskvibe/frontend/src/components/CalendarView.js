import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// اضافه کردن ایمپورت‌های MUI و آیکون‌ها
import { Box, Typography, TextField, Button, MenuItem, Stack, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Tooltip, Fade } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddTaskIcon from '@mui/icons-material/AddTask';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import BoltIcon from '@mui/icons-material/Bolt';
import DailyPhoto from './DailyPhoto';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CalendarView() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    energy_level: 'LOW',
    due_date: '',
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/tasks/')
      .then(response => {
        const formattedTasks = response.data.map(task => ({
          id: task.id,
          title: task.title,
          start: new Date(task.due_date),
          end: new Date(task.due_date),
          allDay: false,
          completed: task.completed,
          description: task.description,
          energy_level: task.energy_level,
        }));
        setTasks(formattedTasks);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setNewTask({ title: '', description: '', energy_level: 'LOW', due_date: start.toISOString() });
    setOpenDialog(true);
  };

  const handleAddTask = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/tasks/', {
        title: newTask.title,
        description: newTask.description,
        energy_level: newTask.energy_level,
        due_date: newTask.due_date,
      });
      setTasks([...tasks, {
        id: response.data.id,
        title: response.data.title,
        start: new Date(response.data.due_date),
        end: new Date(response.data.due_date),
        allDay: false,
        completed: response.data.completed,
        description: response.data.description,
        energy_level: response.data.energy_level,
      }]);
      setNewTask({ title: '', description: '', energy_level: 'LOW', due_date: '' });
      setSelectedDate(null);
      setOpenDialog(false);
      setError('');
    } catch (error) {
      setError('افزودن تسک ناموفق بود!');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await axios.post(`http://localhost:8000/api/tasks/${taskId}/complete/`);
      setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: true } : task));
    } catch (error) {
      setError('تکمیل تسک ناموفق بود!');
    }
  };

  const energyIcons = {
    LOW: <BoltIcon color="info" sx={{ mr: 0.5 }} />, // 💧
    MEDIUM: <BoltIcon color="warning" sx={{ mr: 0.5 }} />, // ⚡️
    HIGH: <BoltIcon color="error" sx={{ mr: 0.5 }} />, // 🔥
  };
  const energyLabels = {
    LOW: 'کم انرژی',
    MEDIUM: 'متوسط',
    HIGH: 'پر انرژی',
  };
  const energyEmojis = {
    LOW: '💧',
    MEDIUM: '⚡️',
    HIGH: '🔥',
  };

  // فیلتر تسک‌های روز انتخاب‌شده
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };
  const filteredTasks = selectedDate
    ? tasks.filter(task => isSameDay(new Date(task.start), selectedDate))
    : [];

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        <CalendarMonthIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
        تقویم تسک‌ها <span role="img" aria-label="calendar">🗓️</span>
      </Typography>
      <Calendar
        localizer={localizer}
        events={tasks}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, marginBottom: 24 }}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.completed ? '#8B5CF6' : '#3B82F6',
            color: 'white',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
          },
        })}
      />
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>افزودن تسک برای {selectedDate && selectedDate.toLocaleDateString('fa-IR')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="عنوان تسک"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="توضیحات"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              select
              label="سطح انرژی"
              value={newTask.energy_level}
              onChange={e => setNewTask({ ...newTask, energy_level: e.target.value })}
              fullWidth
            >
              <MenuItem value="LOW">💧 کم انرژی</MenuItem>
              <MenuItem value="MEDIUM">⚡️ متوسط</MenuItem>
              <MenuItem value="HIGH">🔥 پر انرژی</MenuItem>
            </TextField>
            <TextField
              label="موعد انجام"
              type="datetime-local"
              value={newTask.due_date.slice(0, 16)}
              onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">انصراف</Button>
          <Button onClick={handleAddTask} variant="contained" color="primary" startIcon={<AddTaskIcon />}>افزودن تسک</Button>
        </DialogActions>
      </Dialog>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {selectedDate ? `تسک‌های ${selectedDate.toLocaleDateString('fa-IR')}` : 'یک روز را از تقویم انتخاب کنید'} <span role="img" aria-label="list">📋</span>
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
          <CircularProgress />
        </Box>
      ) : !selectedDate ? (
        <Typography color="text.secondary" align="center" sx={{ my: 2 }}>لطفاً یک روز را از تقویم انتخاب کنید.</Typography>
      ) : filteredTasks.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 2 }}>تسکی برای این روز وجود ندارد.</Typography>
      ) : (
        <List>
          {filteredTasks.map((task, i) => (
            <Fade in timeout={400 + i * 50} key={task.id}>
              <Tooltip title={task.title} arrow>
                <ListItem
                  secondaryAction={
                    !task.completed && (
                      <Button
                        onClick={() => handleCompleteTask(task.id)}
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                      >
                        انجام شد
                      </Button>
                    )
                  }
                  sx={{ 
                    mb: 1, 
                    bgcolor: task.completed ? 'success.light' : 'background.default', 
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  <ListItemIcon>
                    {task.completed ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={<>
                      {task.title} {task.completed && <Chip label="انجام شد" color="success" size="small" sx={{ ml: 1 }} />} {energyEmojis[task.energy_level]}
                    </>}
                    secondary={<>
                      {task.description} <br />
                      <Chip
                        icon={energyIcons[task.energy_level]}
                        label={energyLabels[task.energy_level]}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                      {task.due_date && (
                        <span style={{ marginRight: 8 }}>
                          <span role="img" aria-label="clock">⏰</span> {new Date(task.start).toLocaleString('fa-IR')}
                        </span>
                      )}
                    </>}
                  />
                </ListItem>
              </Tooltip>
            </Fade>
          ))}
        </List>
      )}
      {/* نمایش عکس روز برای روز انتخاب‌شده */}
      {selectedDate && (
        <Box sx={{mt:3}}>
          <DailyPhoto date={selectedDate} />
        </Box>
      )}
    </Box>
  );
}

export default CalendarView;