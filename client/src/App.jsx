import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getMeStart, getMeSuccess, getMeFailure } from '@/redux/authSlice';
import authService from '@/services/authService';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import LandingPage from '@/pages/LandingPage';
import APIBuilderPage from '@/pages/APIBuilderPage';
import CollectionsPage from '@/pages/CollectionsPage';
import TestRunnerPage from '@/pages/TestRunnerPage';

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  // Restore user session on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(getMeStart());
      authService
        .getMe(token)
        .then((user) => {
          dispatch(getMeSuccess(user));
        })
        .catch((err) => {
          dispatch(getMeFailure(err));
        });
    }
  }, [isAuthenticated, token, dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder"
        element={
          <ProtectedRoute>
            <APIBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collections"
        element={
          <ProtectedRoute>
            <CollectionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/runner"
        element={
          <ProtectedRoute>
            <TestRunnerPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
