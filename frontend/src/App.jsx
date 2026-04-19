import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const ChatBot = lazy(() => import('./components/ChatBot'));

// Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const About = lazy(() => import('./pages/About'));
const LawyerListing = lazy(() => import('./pages/LawyerListing'));
const LawyerProfile = lazy(() => import('./pages/LawyerProfile'));
const Booking = lazy(() => import('./pages/Booking'));
const Chat = lazy(() => import('./pages/Chat'));
const VideoCall = lazy(() => import('./pages/VideoCall'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" />;
  
  return children;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        
        <main className="flex-grow">
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
              <Route path="/lawyers" element={<LawyerListing />} />
              <Route path="/lawyer/:id" element={<LawyerProfile />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile/settings" element={
                <ProtectedRoute roles={['lawyer']}>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              
              <Route path="/booking/:lawyerId" element={
                <ProtectedRoute roles={['client']}>
                  <Booking />
                </ProtectedRoute>
              } />
              
              <Route path="/chat/:consultationId" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              
              <Route path="/video-call/:consultationId" element={
                <ProtectedRoute>
                  <VideoCall />
                </ProtectedRoute>
              } />
              
              {/* fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
