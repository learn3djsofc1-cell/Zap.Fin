import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import DocsPage from './docs/DocsPage.tsx';
import DashboardLayout from './dashboard/DashboardLayout.tsx';
import OverviewPage from './dashboard/OverviewPage.tsx';
import MixerPage from './dashboard/MixerPage.tsx';
import MessengerPage from './dashboard/MessengerPage.tsx';
import BridgePage from './dashboard/BridgePage.tsx';
import VpnPage from './dashboard/VpnPage.tsx';
import SettingsPage from './dashboard/SettingsPage.tsx';
import LoginPage from './auth/LoginPage.tsx';
import SignupPage from './auth/SignupPage.tsx';
import { AuthProvider, ProtectedRoute } from './lib/AuthContext.tsx';
import { ToastProvider } from './lib/toast.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<ErrorBoundary><OverviewPage /></ErrorBoundary>} />
                <Route path="mixer" element={<ErrorBoundary><MixerPage /></ErrorBoundary>} />
                <Route path="messenger" element={<ErrorBoundary><MessengerPage /></ErrorBoundary>} />
                <Route path="bridge" element={<ErrorBoundary><BridgePage /></ErrorBoundary>} />
                <Route path="vpn" element={<ErrorBoundary><VpnPage /></ErrorBoundary>} />
                <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
