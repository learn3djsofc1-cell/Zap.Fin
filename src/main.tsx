import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import App from './App.tsx';
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import DashboardLayout from './dashboard/DashboardLayout.tsx';
import OverviewPage from './dashboard/OverviewPage.tsx';
import CardsPage from './dashboard/CardsPage.tsx';
import TopupsPage from './dashboard/TopupsPage.tsx';
import ControlsPage from './dashboard/ControlsPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<OverviewPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="topups" element={<TopupsPage />} />
            <Route path="controls" element={<ControlsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
