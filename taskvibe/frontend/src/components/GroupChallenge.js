import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
// اضافه کردن ایمپورت‌های MUI و آیکون‌ها
import { Box, Typography, TextField, Button, MenuItem, List, ListItem, ListItemIcon, ListItemText, Divider, Stack, Chip } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import UpdateIcon from '@mui/icons-material/Update';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import Autocomplete from '@mui/material/Autocomplete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';

function GroupChallenge() {
  const [groups, setGroups] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengeUpdates, setChallengeUpdates] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengeTarget, setChallengeTarget] = useState(5);
  const [challengeDeadline, setChallengeDeadline] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatBoxRef = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [managedMembers, setManagedMembers] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/groups/')
      .then(response => {
        setGroups(response.data);
        if (response.data.length > 0) setSelectedGroup(response.data[0].id);
      })
      .catch(error => {
        if (error.response?.status === 401) {
          alert('لطفاً دوباره وارد شوید (توکن منقضی شده یا معتبر نیست)');
          localStorage.removeItem('access_token');
          window.location.reload();
        }
      })
      .finally(() => setLoading(false));
    axios.get('http://localhost:8000/api/challenges/')
      .then(response => setChallenges(response.data))
      .catch(error => {
        if (error.response?.status === 401) {
          alert('لطفاً دوباره وارد شوید (توکن منقضی شده یا معتبر نیست)');
          localStorage.removeItem('access_token');
          window.location.reload();
        }
      });
    // WebSocket setup (optional, unchanged)
    if (groups.length > 0) {
      const ws = new WebSocket(`ws://localhost:8000/ws/challenge/${groups[0]?.id}/`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setChallengeUpdates(prev => [...prev, data.message]);
      };
      return () => ws.close();
    }
    // Fetch chat history
    if (selectedGroup) {
      axios.get(`http://localhost:8000/api/groups/${selectedGroup}/messages/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      })
        .then(res => setChatMessages(res.data))
        .catch(() => setChatMessages([]));
      // WebSocket for chat
      const ws = new WebSocket(`ws://localhost:8000/ws/chat/${selectedGroup}/`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setChatMessages(prev => [...prev, data.message]);
      };
      ws.onclose = () => {};
      ws.onerror = () => {};
      // Save ws to ref for sending
      chatBoxRef.current = ws;
      return () => ws.close();
    }
  }, []); // Only run once on mount

  useEffect(() => {
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      if (group) {
        setCurrentGroup(group);
        // Now `group.members` is an array of user objects
        setManagedMembers(group.members || []);
      }
    } else {
      setCurrentGroup(null);
    }
  }, [selectedGroup, groups]);


  const handleUserSearch = async (event, value) => {
    if (value.length < 2) {
      setUserOptions([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8000/api/users/search/?q=${value}`);
      // Filter out users that are already members
      const currentMemberIds = managedMembers.map(m => m.id);
      setUserOptions(response.data.filter(u => !currentMemberIds.includes(u.id)));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('نام گروه را وارد کنید!');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/groups/', {
        name: groupName,
        member_ids: groupMembers.map(m => m.id),
      });
      setGroups([...groups, response.data]);
      setGroupName('');
      setGroupMembers([]);
      setError('');
      setSelectedGroup(response.data.id); // Select the new group
    } catch (error) {
      setError(error.response?.data?.detail || 'ساخت گروه ناموفق بود!');
    }
  };

  const handleCreateChallenge = async () => {
    if (!selectedGroup) {
      setError('یک گروه انتخاب کنید!');
      return;
    }
    if (!challengeTitle.trim() || !challengeDescription.trim() || !challengeDeadline) {
      setError('همه فیلدهای چالش را پر کنید!');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/challenges/', {
        group: selectedGroup,
        title: challengeTitle,
        description: challengeDescription,
        target_tasks: challengeTarget,
        deadline: challengeDeadline
      });
      setChallenges([...challenges, response.data]);
      setChallengeTitle('');
      setChallengeDescription('');
      setChallengeTarget(5);
      setChallengeDeadline('');
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || error.response?.data?.error || 'ساخت چالش ناموفق بود!');
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && chatBoxRef.current && localStorage.getItem('user_id')) {
      chatBoxRef.current.send(JSON.stringify({
        user_id: localStorage.getItem('user_id'),
        content: chatInput.trim(),
      }));
      setChatInput('');
    }
  };

  const handleOpenManageDialog = () => {
    if (currentGroup) {
      setUserOptions([]); // Reset search options
      setManagedMembers(currentGroup.members || []);
      setOpenManageDialog(true);
    }
  };

  const handleUpdateMembers = async () => {
    if (!currentGroup) return;
    try {
      const response = await axios.post(`http://localhost:8000/api/groups/${currentGroup.id}/manage_members/`, {
        user_ids: managedMembers.map(m => m.id),
      });
      setGroups(groups.map(g => g.id === currentGroup.id ? response.data : g));
      setOpenManageDialog(false);
    } catch (error) {
      setError('خطا در بروزرسانی اعضا');
    }
  };


  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        <GroupsIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
        گروه‌ها و چالش‌ها <span role="img" aria-label="trophy">🏆</span>
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="نام گروه"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          fullWidth
        />
        <Autocomplete
          multiple
          options={userOptions}
          getOptionLabel={(option) => option.username}
          value={groupMembers}
          onChange={(event, newValue) => {
            setGroupMembers(newValue);
          }}
          onInputChange={handleUserSearch}
          renderInput={(params) => (
            <TextField
              {...params}
              label="افزودن اعضا"
              placeholder="نام کاربری را برای جستجو وارد کنید"
            />
          )}
          filterOptions={(x) => x}
          noOptionsText="کاربری یافت نشد"
        />
        <Button
          onClick={handleCreateGroup}
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          fullWidth
        >
          ساخت گروه
        </Button>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <TextField
            select
            label="انتخاب گروه"
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            fullWidth
            >
            <MenuItem value="">انتخاب گروه</MenuItem>
            {groups.map(group => (
                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
            ))}
        </TextField>
        <Tooltip title="مدیریت اعضا">
            <span>
                <IconButton onClick={handleOpenManageDialog} disabled={!selectedGroup}>
                    <ManageAccountsIcon />
                </IconButton>
            </span>
        </Tooltip>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          label="انتخاب گروه"
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
          fullWidth
        >
          <MenuItem value="">انتخاب گروه</MenuItem>
          {groups.map(group => (
            <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="عنوان چالش"
          value={challengeTitle}
          onChange={e => setChallengeTitle(e.target.value)}
          fullWidth
        />
        <TextField
          label="توضیحات چالش"
          value={challengeDescription}
          onChange={e => setChallengeDescription(e.target.value)}
          fullWidth
        />
        <TextField
          label="تعداد تسک هدف"
          type="number"
          value={challengeTarget}
          onChange={e => setChallengeTarget(Number(e.target.value))}
          fullWidth
        />
        <TextField
          label="ددلاین"
          type="datetime-local"
          value={challengeDeadline}
          onChange={e => setChallengeDeadline(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <Button
          onClick={handleCreateChallenge}
          variant="contained"
          color="secondary"
          startIcon={<EmojiEventsIcon />}
          fullWidth
        >
          ساخت چالش
        </Button>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        <EmojiEventsIcon color="warning" sx={{ verticalAlign: 'middle', mr: 1 }} />
        چالش‌های فعال <span role="img" aria-label="challenge">🚩</span>
      </Typography>
      <List>
        {challenges.map(challenge => (
          <ListItem key={challenge.id} sx={{ 
  bgcolor: 'background.default', 
  borderRadius: 2, 
  mb: 1,
  border: 1,
  borderColor: 'divider'
}}>
            <ListItemIcon><EmojiEventsIcon color="warning" /></ListItemIcon>
            <ListItemText
              primary={challenge.title}
              secondary={<>
                هدف: <Chip label={challenge.target_tasks + ' تسک'} size="small" color="info" sx={{ mr: 1 }} />
                تا {new Date(challenge.deadline).toLocaleDateString('fa-IR')}
                <br />{challenge.description}
              </>}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        <UpdateIcon color="info" sx={{ verticalAlign: 'middle', mr: 1 }} />
        بروزرسانی چالش‌ها <span role="img" aria-label="update">🔄</span>
      </Typography>
      <List>
        {challengeUpdates.map((update, index) => (
          <ListItem key={index} sx={{ 
  bgcolor: 'background.default', 
  borderRadius: 2, 
  mb: 1,
  border: 1,
  borderColor: 'divider'
}}>
            <ListItemIcon><UpdateIcon color="info" /></ListItemIcon>
            <ListItemText
              primary={`کاربر ${update.user_id} ${update.completed_tasks} تسک انجام داد`}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        <ChatIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
        گفتگوی گروهی <span role="img" aria-label="chat">💬</span>
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}><CircularProgress /></Box>
      ) : chatMessages.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 2 }}>پیامی وجود ندارد.</Typography>
      ) : (
        <Box sx={{ maxHeight: 250, overflowY: 'auto', bgcolor: 'background.default', borderRadius: 2, p: 2, mb: 1, border: '1px solid #e5e7eb' }}>
          {chatMessages.map((msg, i) => (
            <Fade in timeout={400 + i * 50} key={i}>
              <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', alignItems: msg.user === localStorage.getItem('username') ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ 
  bgcolor: msg.user === localStorage.getItem('username') ? 'primary.light' : 'background.default', 
  color: 'text.primary', 
  px: 2, 
  py: 1, 
  borderRadius: 2, 
  maxWidth: '80%',
  border: 1,
  borderColor: 'divider'
}}>
                  <Typography variant="body2" fontWeight={700}>{msg.user}</Typography>
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(msg.timestamp).toLocaleTimeString('fa-IR')}</Typography>
                </Box>
              </Box>
            </Fade>
          ))}
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
          placeholder="پیام خود را بنویسید..."
          fullWidth
          size="small"
        />
        <Tooltip title="ارسال پیام" arrow>
          <Button variant="contained" color="primary" onClick={handleSendMessage} endIcon={<SendIcon />}>
            ارسال
          </Button>
        </Tooltip>
      </Box>

      <Dialog open={openManageDialog} onClose={() => setOpenManageDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>مدیریت اعضای گروه: {currentGroup?.name}</DialogTitle>
        <DialogContent>
            <Autocomplete
                multiple
                options={userOptions}
                getOptionLabel={(option) => option.username}
                value={managedMembers}
                onChange={(event, newValue) => {
                    setManagedMembers(newValue);
                }}
                onInputChange={handleUserSearch}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label="افزودن یا حذف اعضا"
                    placeholder="نام کاربری را جستجو کنید"
                    />
                )}
                filterOptions={(x) => x}
                noOptionsText="کاربری یافت نشد"
                sx={{mt:2}}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenManageDialog(false)}>انصراف</Button>
            <Button onClick={handleUpdateMembers} variant="contained">ذخیره تغییرات</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GroupChallenge;