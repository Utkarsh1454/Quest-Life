import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Progress from './pages/Progress';
import Login from './pages/Login';
import Register from './pages/Register';
import Workout from './pages/Workout';
import Diet from './pages/Diet';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import Guild from './pages/Guild';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-quest-accent dark:bg-quest-darkest flex flex-col items-center justify-center text-gray-900 dark:text-white font-bold font-sans">
        <div className="w-10 h-10 border-4 border-quest-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <div>Loading Realm...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="quests" element={<Quests />} />
                <Route path="progress" element={<Progress />} />
                <Route path="workout" element={<Workout />} />
                <Route path="diet" element={<Diet />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="guild" element={<Guild />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
