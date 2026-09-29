import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileNavigation from './components/MobileNavigation';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import Crops from './pages/Crops';
import CropDetails from './pages/CropDetails';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Harvests from './pages/Harvests';
import Activities from './pages/Activities';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Styles
import './styles/index.css';

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) return <LoadingSpinner text="Checking authentication status..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <Sidebar />
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="main-layout">
        <Navbar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } />

          {/* Protected Application Routes */}
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/farms" element={<ProtectedLayout><Farms /></ProtectedLayout>} />
          <Route path="/crops" element={<ProtectedLayout><Crops /></ProtectedLayout>} />
          <Route path="/crops/:id" element={<ProtectedLayout><CropDetails /></ProtectedLayout>} />
          <Route path="/expenses" element={<ProtectedLayout><Expenses /></ProtectedLayout>} />
          <Route path="/income" element={<ProtectedLayout><Income /></ProtectedLayout>} />
          <Route path="/harvests" element={<ProtectedLayout><Harvests /></ProtectedLayout>} />
          <Route path="/activities" element={<ProtectedLayout><Activities /></ProtectedLayout>} />
          <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
          <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
