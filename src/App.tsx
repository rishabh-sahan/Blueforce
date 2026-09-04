import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './i18n/i18n';
import './index.css';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './contexts/AuthContext';

import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import HowItWorks from './pages/HowItWorks';
import BrowseWorkers from './pages/BrowseWorkers';
import WorkerDetail from './pages/WorkerDetail';
import Onboarding from './pages/Onboarding';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Verification from './pages/admin/Verification';
import Users from './pages/admin/Users';
import Bookings from './pages/admin/Bookings';

function App() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-[Poppins]">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/services" element={<Services />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/workers" element={<BrowseWorkers />} />
              <Route path="/workers/:id" element={<WorkerDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Signed in */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth roles={['worker', 'customer']}>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth roles={['admin']} redirectTo="/admin/login">
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Navigate to="/admin/verification" replace />} />
                <Route path="verification" element={<Verification />} />
                <Route path="users" element={<Users />} />
                <Route path="bookings" element={<Bookings />} />
              </Route>

              {/* Old links kept alive so existing bookmarks do not 404. */}
              <Route path="/browse-workers" element={<Navigate to="/workers" replace />} />
              <Route path="/worker-dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/employer-dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
