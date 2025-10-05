import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Newsletter from './pages/Newsletter';
import Notifications from './pages/Notifications';
import PushNotifications from './pages/PushNotifications';
import Contests from './pages/Contests';
import WeeklyContest from './pages/WeeklyContest';
import AllParticipants from './pages/AllParticipants';
import AdminFavorites from './pages/AdminFavorites';
import News from './pages/News';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4ade80',
                secondary: '#black',
              },
            },
          }}
        />
        
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/news" element={<News />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/push-notifications" element={<PushNotifications />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/weekly-contest" element={<WeeklyContest />} />
            <Route path="/all-participants" element={<AllParticipants />} />
            <Route path="/admin-favorites" element={<AdminFavorites />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
