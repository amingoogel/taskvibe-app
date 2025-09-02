import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { removeNotification } from '../../store/notificationSlice';

const NotificationBar = () => {
  const notifications = useSelector(state => state.notification.notifications);
  const dispatch = useDispatch();

  if (!notifications.length) return null;
  const { id, message, severity } = notifications[0];

  const handleClose = () => {
    dispatch(removeNotification(id));
  };

  return (
    <Snackbar open autoHideDuration={3000} onClose={handleClose}>
      <Alert severity={severity || 'info'} onClose={handleClose}>{message}</Alert>
    </Snackbar>
  );
};

export default NotificationBar; 