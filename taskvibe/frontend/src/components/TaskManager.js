import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
// اضافه کردن ایمپورت‌های MUI و آیکون‌ها
import { Box, TextField, Button, Typography, MenuItem, Stack, List, ListItem, ListItemIcon, ListItemText, IconButton, Chip, Divider, InputAdornment } from '@mui/material';
import AddTaskIcon from '@mui/icons-material/AddTask';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import BoltIcon from '@mui/icons-material/Bolt';
import SearchIcon from '@mui/icons-material/Search';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import RepeatIcon from '@mui/icons-material/Repeat';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [energyLevel, setEnergyLevel] = useState('LOW');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  // state جستجو و فیلتر
  const [search, setSearch] = useState('');
  const [filterEnergy, setFilterEnergy] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [tags, setTags] = useState('');
  const [recurring, setRecurring] = useState('NONE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/tasks/')
      .then(response => setTasks(response.data))
      .finally(() => setLoading(false));
  }, []);

  const handleAddTask = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/tasks/', {
        title,
        description,
        energy_level: energyLevel,
        due_date: dueDate,
        priority,
        tags,
        recurring,
      });
      setTasks([...tasks, response.data]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('MEDIUM');
      setTags('');
      setRecurring('NONE');
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

  // فیلتر و جستجو روی تسک‌ها
  const filteredTasks = tasks.filter(task =>
    (search === '' || task.title.toLowerCase().includes(search.toLowerCase())) &&
    (filterEnergy === '' || task.energy_level === filterEnergy)
  );

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        <AddTaskIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
        افزودن تسک جدید <span role="img" aria-label="memo">📝</span>
      </Typography>
      <Stack spacing={2}>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="عنوان تسک"
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="توضیحات"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          variant="outlined"
        />
        <TextField
          select
          label="سطح انرژی"
          value={energyLevel}
          onChange={e => setEnergyLevel(e.target.value)}
          fullWidth
        >
          <MenuItem value="LOW">💧 کم انرژی</MenuItem>
          <MenuItem value="MEDIUM">⚡️ متوسط</MenuItem>
          <MenuItem value="HIGH">🔥 پر انرژی</MenuItem>
        </TextField>
        <TextField
          select
          label="اولویت"
          value={priority}
          onChange={e => setPriority(e.target.value)}
          fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><LabelImportantIcon color="warning" /></InputAdornment> }}
        >
          <MenuItem value="LOW">کم</MenuItem>
          <MenuItem value="MEDIUM">متوسط</MenuItem>
          <MenuItem value="HIGH">زیاد</MenuItem>
        </TextField>
        <TextField
          label="برچسب‌ها (با ویرگول جدا کنید)"
          value={tags}
          onChange={e => setTags(e.target.value)}
          fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start">🏷️</InputAdornment> }}
        />
        <TextField
          select
          label="تکرار"
          value={recurring}
          onChange={e => setRecurring(e.target.value)}
          fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><RepeatIcon color="info" /></InputAdornment> }}
        >
          <MenuItem value="NONE">بدون تکرار</MenuItem>
          <MenuItem value="DAILY">روزانه</MenuItem>
          <MenuItem value="WEEKLY">هفتگی</MenuItem>
          <MenuItem value="MONTHLY">ماهانه</MenuItem>
        </TextField>
        <TextField
          label="موعد انجام"
          type="datetime-local"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <Button
          onClick={handleAddTask}
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddTaskIcon />}
          fullWidth
        >
          افزودن تسک
        </Button>
      </Stack>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" fontWeight={700} gutterBottom>
        <TaskAltIcon color="success" sx={{ verticalAlign: 'middle', mr: 1 }} />
        تسک‌های شما <span role="img" aria-label="checklist">✅</span>
      </Typography>
      {/* جستجو و فیلتر */}
      <Stack direction={{xs:'column',sm:'row'}} spacing={2} sx={{mb:2}}>
        <TextField
          label="جستجو در عنوان"
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="فیلتر سطح انرژی"
          value={filterEnergy}
          onChange={e => setFilterEnergy(e.target.value)}
          fullWidth
        >
          <MenuItem value="">همه</MenuItem>
          <MenuItem value="LOW">💧 کم انرژی</MenuItem>
          <MenuItem value="MEDIUM">⚡️ متوسط</MenuItem>
          <MenuItem value="HIGH">🔥 پر انرژی</MenuItem>
        </TextField>
      </Stack>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
          <CircularProgress />
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 2 }}>تسکی وجود ندارد.</Typography>
      ) : (
        <List>
          {filteredTasks.map((task, idx) => (
            <Fade in timeout={400 + idx * 50} key={task.id}>
              <ListItem
                secondaryAction={
                  !task.completed && (
                    <Tooltip title="تکمیل تسک" arrow>
                      <IconButton edge="end" color="success" onClick={() => handleCompleteTask(task.id)}>
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
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
                    {task.priority && <Chip label={`اولویت: ${priorityLabel(task.priority)}`} color="warning" size="small" sx={{ ml: 1 }} icon={<LabelImportantIcon />} />}
                    {task.recurring && task.recurring !== 'NONE' && <Chip label={`تکرار: ${recurringLabel(task.recurring)}`} color="info" size="small" sx={{ ml: 1 }} icon={<RepeatIcon />} />}
                    {task.tags && task.tags.split(',').map((tag, i) => <Chip key={i} label={tag.trim()} color="default" size="small" sx={{ ml: 0.5 }} />)}
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
                        <span role="img" aria-label="clock">⏰</span> {new Date(task.due_date).toLocaleString('fa-IR')}
                      </span>
                    )}
                  </>}
                />
              </ListItem>
            </Fade>
          ))}
        </List>
      )}
    </Box>
  );
}

function priorityLabel(val) {
  switch (val) {
    case 'LOW': return 'کم';
    case 'MEDIUM': return 'متوسط';
    case 'HIGH': return 'زیاد';
    default: return val;
  }
}
function recurringLabel(val) {
  switch (val) {
    case 'DAILY': return 'روزانه';
    case 'WEEKLY': return 'هفتگی';
    case 'MONTHLY': return 'ماهانه';
    default: return '';
  }
}

export default TaskManager;