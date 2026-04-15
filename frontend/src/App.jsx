// src/App.jsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/UI';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AddCandidate from './pages/AddCandidate';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 transition-colors duration-300">
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
              style: { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
              style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/vote"      element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />
            <Route path="/results"   element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin"     element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            <Route
               path="/add-candidate"
              element={
               <ProtectedRoute adminOnly>
                <AddCandidate />
               </ProtectedRoute>
  }
/>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
