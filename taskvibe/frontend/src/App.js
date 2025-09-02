import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import CalendarView from './components/CalendarView';
import TaskManager from './components/TaskManager';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import NotificationBar from './components/common/NotificationBar';
import DailyPhoto from './components/DailyPhoto';
import MoodTracker from './components/MoodTracker';
import GroupChallenge from './components/GroupChallenge';
import Analytics from './components/Analytics';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import Groups from './pages/Groups';
import './App.css';
import { useSelector } from 'react-redux';

function App() {
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const onboardingDone = localStorage.getItem('onboarding_done') === 'true';

  return (
    <>
      <NotificationBar />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/" element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            onboardingDone ? <Navigate to="/login" /> : <Navigate to="/onboarding" />
          )
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;